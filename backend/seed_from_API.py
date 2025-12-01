import requests
import pyodbc
import os
import re
import string
from dotenv import load_dotenv

# --- CONFIGURATION ---
BASE_URL = "https://www.themealdb.com/api/json/v1/1/search.php?f="
LETTERS_TO_IMPORT = list(string.ascii_lowercase) 

load_dotenv()

DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS,1433')
DB_DATABASE = os.getenv('DB_DATABASE', 'PantryProject')
DB_USER = os.getenv('DB_USER', 'pantry_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')

def get_db_connection():
    conn_string = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_DATABASE};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )
    return pyodbc.connect(conn_string)

def ensure_prep_column(cursor):
    try:
        cursor.execute("SELECT Preparation FROM RecipeIngredients WHERE 1=0")
    except pyodbc.Error:
        print("Adding 'Preparation' column to RecipeIngredients table...")
        cursor.execute("ALTER TABLE RecipeIngredients ADD Preparation NVARCHAR(255)")
        cursor.commit()

# ==============================================================================
#  INGREDIENT CLEANING LOGIC
# ==============================================================================

def normalize_fraction_text(text):
    if not text: return ""
    replacements = {
        '½': ' 0.5 ', '⅓': ' 0.333 ', '⅔': ' 0.666 ', '¼': ' 0.25 ', '¾': ' 0.75 ',
        '⅕': ' 0.2 ', '⅖': ' 0.4 ', '⅗': ' 0.6 ', '⅘': ' 0.8 ', '⅙': ' 0.166 ',
        '⅚': ' 0.833 ', '⅛': ' 0.125 ', '⅜': ' 0.375 ', '⅝': ' 0.625 ', '⅞': ' 0.875 '
    }
    for char, val in replacements.items():
        text = text.replace(char, val)
    
    range_match = re.search(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)", text)
    if range_match:
        val1 = float(range_match.group(1))
        val2 = float(range_match.group(2))
        avg = (val1 + val2) / 2
        text = text.replace(range_match.group(0), str(avg))
    return text

def clean_adjectives(text):
    if not text: return "", []
    
    # We KEEP valid units (pinch, can, bunch, etc)
    noise_words = [
        'sliced', 'chopped', 'diced', 'minced', 'crushed', 'peeled', 'grated', 'skinned',
        'seeded', 'deseeded', 'halved', 'quartered', 'cubed', 'shredded', 'mashed', 'beaten',
        'whisked', 'sifted', 'melted', 'softened', 'toasted', 'roasted', 'grilled', 'fried',
        'cooked', 'boiled', 'steamed', 'poached', 'baked', 'smoked', 'pickled', 'drained',
        'rinsed', 'scrubbed', 'washed', 'cleaned', 'trimmed', 'pitted', 'hulled', 'zested',
        'juiced', 'kneaded', 'dissolved', 'warm', 'cold', 'hot', 'boiling', 'frozen', 'chilled',
        'room temp', 'fresh', 'dried', 'dry', 'raw', 'ground', 'whole', 'lean', 'boneless',
        'skinless', 'fatty', 'meaty', 'ancho', 'white', 'brown', 'red', 'green', 'large',
        'medium', 'small', 'thick', 'thin', 'jumbo', 'mini', 'generous', 'heaping', 'heaped',
        'rounded', 'level', 'scant', 'roughly', 'finely', 'coarsely', 'thinly', 'thickly',
        'lightly', 'to serve', 'for serving', 'to taste', 'for cooking', 'for frying',
        'for baking', 'for dusting', 'for sprinkling', 'for garnish', 'garnish', 'sprinkling',
        'drizzle', 'dipping', 'topping', 'filling', 'coating', 'icing', 'dusting', 'optional',
        'about', 'approx', 'leaf', 'leaves', 'cut', 'into', 'inch', 'cubes', 'cm', 'mm', 'and',
        'spinkling', 'sprinking', 'bulb', 'bulbs', 'stalk', 'stalks', 'reserve', 'reserved', 
        'frond', 'fronds', 'zest', 'juice', 
        'soaked', 'overnight', 'water', 'sized', 'marble', 'crumbled', 'pieces', 
        'lengthways', 'fillets', 'shanks', 'top', 'tail', 'in', 'half'
    ]
    
    clean_text = text
    removed_words = []
    for word in noise_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, clean_text, flags=re.IGNORECASE):
            removed_words.append(word)
            clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
    
    clean_text = re.sub(r'\s+of\s*$', '', clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text, removed_words

def normalize_unit_names(unit):
    unit = unit.lower().strip()
    unit = unit.rstrip('.,')
    
    fixes = {
        'parts': 'part', 'grams': 'g', 'kilograms': 'kg', 'kilos': 'kg',
        'liters': 'l', 'litres': 'l', 'milliliters': 'ml', 'millilitres': 'ml',
        'tablespoons': 'tbsp', 'tablespoon': 'tbsp', 'tblsp': 'tbsp', 'tbs': 'tbsp', 'tbls': 'tbsp',
        'teaspoons': 'tsp', 'teaspoon': 'tsp', 'cups': 'cup',
        'ounces': 'oz', 'z': 'oz', 'pounds': 'lb', 'lbs': 'lb',
        'slices': 'slice', 'handfuls': 'handful', 'bunches': 'bunch', 'cans': 'can'
    }
    return fixes.get(unit, unit)

def get_inferred_unit(ing_name):
    name = ing_name.lower()
    if 'garlic' in name: return 'clove'
    cup_items = ['rice', 'water', 'stock', 'broth', 'milk', 'cream', 'wine', 'juice', 'soup', 'couscous', 'quinoa', 'oats', 'lentils', 'flour', 'sugar']
    if any(x in name for x in cup_items): return 'cup'
    weight_items = ['pasta', 'spaghetti', 'noodles', 'beef', 'chicken', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'butter', 'cheese', 'chocolate']
    if any(x in name for x in weight_items): return 'g'
    return 'count'

# --- NEW: Extract Prep from Name BEFORE resolving ---
def extract_prep_from_name(ing_name):
    """
    Checks if the ingredient name itself contains prep info (e.g. 'chopped_onion').
    Returns: (clean_name, prep_string)
    """
    name = ing_name.lower()
    prep_found = []
    
    # EXPANDED LIST OF PREP KEYWORDS
    prep_keywords = [
        'chopped', 'diced', 'minced', 'sliced', 'grated', 'crushed', 'beaten', 
        'cooked', 'dried', 'pickled', 'chilled', 'warm', 'cold', 'hot', 'boiling',
        'cubed', 'shredded', 'halved', 'quartered', 'skinned', 'seeded', 'peeled',
        'rinsed', 'drained', 'crumbled'
    ]
    
    for word in prep_keywords:
        if word in name:
            prep_found.append(word)
            # Remove the prep word from the name (e.g. "chopped_onion" -> "onion")
            name = name.replace(word, '').replace('__', '_').strip('_')

    return name, ", ".join(prep_found) if prep_found else None

def resolve_ingredient_name(ing_name, measure):
    name = ing_name.lower()
    measure = measure.lower()
    
    if name == 'pepper':
        if 'red' in measure: return 'red_bell_pepper'
        if 'green' in measure: return 'green_bell_pepper'
        if 'yellow' in measure: return 'yellow_bell_pepper'
        if any(w in measure for w in ['pinch', 'tsp', 'teaspoon', 'dash']): return 'black_pepper'
        return 'black_pepper'

    if name == 'squash':
        if 'yellow' in measure: return 'yellow_squash'
        if 'butternut' in measure: return 'butternut_squash'
        
    if name == 'egg' or name == 'eggs':
        if 'pickled' in measure: return 'pickled_egg'
        if 'white' in measure: return 'egg_white'
        if 'yolk' in measure: return 'egg_yolk'
    
    ingredient_map = { 
        'red_onions': 'red_onion', 'onions': 'onion',
        'spring_onions': 'spring_onion', 'scallions': 'spring_onion',
        'sweet_potatoes': 'sweet_potato', 'potatoes': 'potato', 
        'baby_new_potatoes': 'baby_new_potato', 'red_potatoes': 'red_potato',
        'floury_potatoes': 'potato', # Merge floury to generic
        'floury_potato': 'potato',
        'small_potatoes': 'baby_new_potato',
        'carrots': 'carrot',
        'tomatoes': 'tomato', 'vine_tomatoes': 'vine_tomato', 'plum_tomatoes': 'plum_tomato', 'cherry_tomatoes': 'cherry_tomato',
        'lemons': 'lemon', 'limes': 'lime', 'bananas': 'banana', 'apples': 'apple',
        'braeburn_apples': 'braeburn_apple', 'bramley_apples': 'bramley_apple',
        'mushrooms': 'mushroom', 'shiitake_mushrooms': 'shiitake_mushroom', 'oyster_mushrooms': 'oyster_mushroom',
        'sausages': 'sausage',
        'tortillas': 'tortilla', 'corn_tortillas': 'corn_tortilla',
        'black_olives': 'black_olive', 'green_olives': 'green_olive',
        'bean_sprouts': 'bean_sprout',
        'cashew_nuts': 'cashews', 'pecan_nuts': 'pecans', 'hazlenuts': 'hazelnuts', 'chestnuts': 'chestnut',
        'strawberries': 'strawberry', 'raspberries': 'raspberry', 'blueberries': 'blueberry',
        'peaches': 'peach', 'pears': 'pear', 'figs': 'fig', 'cranberries': 'cranberry',
        
        # MEAT & SEAFOOD
        'prawns': 'shrimp', 'raw_king_prawns': 'shrimp', 'raw_frozen_prawns': 'shrimp',
        'tiger_prawns': 'shrimp', 'king_prawn': 'shrimp', 'tiger_prawn': 'shrimp',
        'sardines': 'sardine', 'anchovy_fillet': 'anchovies',
        'chicken_breasts': 'chicken_breast', 'chicken_legs': 'chicken_leg', 'chicken_thighs': 'chicken_thigh',
        'lamb_shanks': 'lamb_shank', 'duck_legs': 'duck_leg', 'pork_chops': 'pork_chop',
        'minced_beef': 'ground_beef', 'lean_minced_beef': 'ground_beef', 'minced_pork': 'ground_pork',
        
        # DAIRY & CHEESE
        'parmesan_cheese': 'parmesan', 'cheddar_cheese': 'cheddar',
        'gruyère': 'gruyere', 'egg_yolks': 'egg_yolk',
        'feta_cheese': 'feta', 'cubed_feta_cheese': 'feta',

        # SUGAR & SPICE
        'sugar': 'granulated_sugar', 'caster_sugar': 'granulated_sugar',
        'dark_brown_sugar': 'brown_sugar', 'dark_brown_soft_sugar': 'brown_sugar',
        'dark_soft_brown_sugar': 'brown_sugar', 'light_brown_soft_sugar': 'brown_sugar',
        'muscovado_sugar': 'brown_sugar',
        'icing_sugar': 'powdered_sugar',
        'chilli_powder': 'chili_powder', 'hot_chilli_powder': 'hot_chili_powder', 'red_chilli_powder': 'red_chili_powder',
        'red_chili_flakes': 'chili_flake', 'chilli_flakes': 'chili_flake', 'red_pepper_flakes': 'chili_flake',
        'ancho_chilies': 'ancho_chili', 'birds-eye_chilies': 'birds-eye_chili', 'dried_red_chilies': 'dried_red_chili',
        'tomato_purée': 'tomato_puree',
        'plain_chocolate': 'dark_chocolate',
        
        # MISC / PREP LEAKS
        'garlic_clove': 'garlic', 'garlic_cloves': 'garlic', 'minced_garlic': 'garlic', 'garlic_bulb': 'garlic',
        'plain_flour': 'all_purpose_flour', 'white_flour': 'all_purpose_flour', 'flour': 'all_purpose_flour',
        'corn_flour': 'cornstarch',
        'bicarbonate_of_soda': 'baking_soda',
        'cider_vinegar': 'apple_cider_vinegar',
        'red_pepper': 'red_bell_pepper', 'green_pepper': 'green_bell_pepper', 'yellow_pepper': 'yellow_bell_pepper',
        'challots': 'shallots',
        'tinned_tomatos': 'canned_tomatoes', 'chopped_tomatoes': 'canned_tomatoes', 'diced_tomatoes': 'canned_tomatoes', 'diced_tomato': 'canned_tomatoes',
        'chopped_onion': 'onion', 'chopped_parsley': 'parsley', 'freshly_chopped_parsley': 'parsley', 'chopped_chive': 'chives',
        'can_of_chickpeas': 'chickpeas', 'bread_slice': 'bread', 'white_bread': 'bread', 'wholegrain_bread': 'bread', 'fillet_of_steak': 'beef_fillet',
        'hot_beef_stock': 'beef_stock', 'cold_water': 'water', 'boiling_water': 'water', 'chilled_butter': 'butter'
    }
    
    return ingredient_map.get(name, name)

def parse_measure_advanced(text):
    clean_text = normalize_fraction_text(text).strip()
    clean_text = re.sub(r"\(\s*\d+.*?\)", "", clean_text)
    dimensions = []
    def remove_dimension(match):
        dimensions.append(match.group(0))
        return ""
    dim_pattern = r"(\d+(?:[\s\.\/]+\d+)?)\s*-?\s*(inch|cm|mm)\b"
    clean_text = re.sub(dim_pattern, remove_dimension, clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"^(zest|juice)( and juice)? of\s*", "", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"^[x\(\)\~\-\s]+", "", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"^g\/", "", clean_text, flags=re.IGNORECASE) 
    clean_text = re.sub(r"^g\s", "", clean_text, flags=re.IGNORECASE)
    
    if re.match(r"^an?\s", clean_text, flags=re.IGNORECASE):
        clean_text = re.sub(r"^an?\s", "1 ", clean_text, flags=re.IGNORECASE)

    match = re.match(r"^([\d\.\/\s]+)(.*)", clean_text)
    total_qty = 0.0
    unit_part = clean_text 

    if match:
        number_part = match.group(1).strip()
        unit_part = match.group(2).strip()
        unit_part = re.sub(r"\/.*", "", unit_part)
        parts = number_part.split()
        for part in parts:
            try:
                if '/' in part:
                    num, den = part.split('/')
                    total_qty += float(num) / float(den)
                else:
                    total_qty += float(part)
            except: pass
    
    if total_qty == 0:
        backup_match = re.search(r"(\d+(?:\.\d+)?)", clean_text)
        if backup_match:
            try:
                total_qty = float(backup_match.group(1))
                unit_part = clean_text.replace(backup_match.group(1), "").strip()
            except: pass

    unit_part, removed_words = clean_adjectives(unit_part)
    unit_part = re.sub(r"^[x\(\)\~\-\s]+", "", unit_part, flags=re.IGNORECASE)
    unit_part = unit_part.replace(')', '').replace('(', '').replace('[]', '').strip()
    unit_part = normalize_unit_names(unit_part)
    unit_part = unit_part[:250]

    if not unit_part: unit_part = None
    
    prep_fix_map = { 'spinkling': 'sprinkling', 'sprinking': 'sprinkling' }
    final_prep_list = []
    for item in (dimensions + removed_words):
        final_prep_list.append(prep_fix_map.get(item, item))
    prep_str = ", ".join(final_prep_list) if final_prep_list else None
    return total_qty, unit_part, prep_str

def is_junk_instruction(text):
    if text.isupper() and len(text) < 60: return True
    patterns = [
        re.compile(r"^step\s*\d*$", re.IGNORECASE),
        re.compile(r"^(pro[-\s]*tips?|tips?|top\s*tips?):?", re.IGNORECASE),
        re.compile(r"^directions:?$", re.IGNORECASE),
        re.compile(r"^method:?$", re.IGNORECASE),
        re.compile(r"^instructions:?$", re.IGNORECASE),
        re.compile(r"^assembly:?$", re.IGNORECASE),
        re.compile(r"^(sauce|dressing|marinade|dip|filling|topping|crust|icing|batter|glaze|Almond filling):?$", re.IGNORECASE),
        re.compile(r"^(marinating|boiling|stir fry|deep fry|rinse|enrich|pan-fry|cook the|prepare the|make the|grill the|season the|rest and serve|assemble the).*", re.IGNORECASE),
        re.compile(r"^(make the |bake the |assemble|prepare the ).*:?$", re.IGNORECASE),
        re.compile(r"^(serving suggestions|variations|optional garnishes):?$", re.IGNORECASE),
        re.compile(r"^watch after ad.*", re.IGNORECASE),
        re.compile(r"^\d+\s*budget egg ideas", re.IGNORECASE),
        re.compile(r"^\d+\s*servings?", re.IGNORECASE),
        re.compile(r"^add'l ingredients", re.IGNORECASE),
        re.compile(r"^for the .*:?$", re.IGNORECASE),
        re.compile(r"^know how:", re.IGNORECASE),
        re.compile(r"^(share\s+and\s+|make\s+and\s+|serve\s+and\s+)?enjoy\s*[!.]*$", re.IGNORECASE),
        re.compile(r"^\d+[\.\)]?$", re.IGNORECASE),
        re.compile(r"^making the soup", re.IGNORECASE)
    ]
    return any(p.match(text) for p in patterns)

def clean_instruction_text(text):
    prefix_cleaner = re.compile(r"^(\d+\s*[\.\)]\s*|\d+\s+|step\s*\d+\s*[-–:]\s*|step\s*\d+\s+-\s+|▢\s*)", re.IGNORECASE)
    return prefix_cleaner.sub("", text).strip()

def clean_inline_headers(text):
    header_cleaner = re.compile(r"^(make the |bake the |assemble|prepare the )[^:]*:\s*", re.IGNORECASE)
    return header_cleaner.sub("", text).strip()

def merge_broken_lines(raw_steps):
    if not raw_steps: return []
    merged_steps = []
    current_buffer = ""
    for line in raw_steps:
        line = clean_instruction_text(line)
        line = clean_inline_headers(line)
        line = line.replace('_', ' ')
        if not line or is_junk_instruction(line): continue
        if not current_buffer:
            current_buffer = line
            continue
        prev_incomplete = current_buffer[-1] not in ['.', '!', '?', ':']
        curr_is_lower = line[0].islower()
        if prev_incomplete or curr_is_lower:
            current_buffer += " " + line
        else:
            merged_steps.append(current_buffer)
            current_buffer = line
    if current_buffer:
        merged_steps.append(current_buffer)
    return merged_steps

def split_dense_step(step):
    if len(step) < 150: return [step]
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z])', step)
    return parts

def import_recipes():
    conn = get_db_connection()
    cursor = conn.cursor()
    ensure_prep_column(cursor)
    print("Starting FINAL OPTIMIZED import (v3)...")

    for letter in LETTERS_TO_IMPORT:
        print(f"Fetching letter '{letter}'...")
        try:
            response = requests.get(f"{BASE_URL}{letter}")
            data = response.json()
        except Exception as e:
            print(f"Error fetching: {e}")
            continue
        if not data or not data['meals']: continue

        for meal in data['meals']:
            try:
                recipe_id = meal['idMeal']
                title = meal['strMeal']
                cursor.execute("SELECT 1 FROM Recipes WHERE RecipeID = ?", (recipe_id,))
                if cursor.fetchone(): continue

                print(f"Importing: {title}")
                cursor.execute("""
                    INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
                    VALUES (?, ?, ?, ?, ?)
                """, (recipe_id, title, 30, 2, 500))

                tags = [meal['strCategory'], meal['strArea']]
                if meal['strTags']: tags.extend(meal['strTags'].split(','))
                for tag in tags:
                    if not tag: continue
                    tag = tag.strip()
                    cursor.execute("SELECT TagID FROM Tags WHERE TagName = ?", (tag,))
                    row = cursor.fetchone()
                    if row: tag_id = row[0]
                    else:
                        cursor.execute("INSERT INTO Tags (TagName) VALUES (?)", (tag,))
                        cursor.execute("SELECT TagID FROM Tags WHERE TagName = ?", (tag,))
                        tag_id = cursor.fetchone()[0]
                    try: cursor.execute("INSERT INTO RecipeTags (RecipeID, TagID) VALUES (?, ?)", (recipe_id, tag_id))
                    except: pass 

                instructions = meal['strInstructions']
                if instructions:
                    raw_fragments = [s for s in instructions.splitlines() if s.strip()]
                    clean_steps = merge_broken_lines(raw_fragments)
                    step_num = 1
                    for step in clean_steps:
                        step = clean_instruction_text(step)
                        split_parts = split_dense_step(step)
                        for part in split_parts:
                            cursor.execute("INSERT INTO Instructions (RecipeID, StepNumber, StepText) VALUES (?, ?, ?)", (recipe_id, step_num, part))
                            step_num += 1

                for i in range(1, 21):
                    ing_name = meal[f'strIngredient{i}']
                    measure = meal[f'strMeasure{i}']
                    
                    if ing_name and ing_name.strip():
                        ing_name = "_".join(ing_name.lower().split())
                        
                        # 1. Extract Prep from Name (Saves "cubed" to prep)
                        ing_name, name_prep = extract_prep_from_name(ing_name)
                        
                        # 2. Resolve/Map Ingredient ("cubed_feta_cheese" -> "feta")
                        ing_name = resolve_ingredient_name(ing_name, measure)
                        
                        qty, unit, measure_prep = parse_measure_advanced(measure)
                        if unit: unit = unit[:250]
                        
                        all_prep = []
                        if name_prep: all_prep.append(name_prep)
                        if measure_prep: all_prep.append(measure_prep)
                        final_prep = ", ".join(all_prep) if all_prep else None
                        
                        if not unit:
                            unit = get_inferred_unit(ing_name)

                        if qty == 0: 
                            to_taste_items = ['salt', 'black_pepper', 'pepper', 'oil', 'water', 'sea_salt', 'olive_oil', 'vegetable_oil']
                            if any(x in ing_name for x in to_taste_items):
                                suffix = 'to taste'
                            else:
                                suffix = 'quantity unspecified'
                                qty = 1
                            if final_prep: final_prep = f"{final_prep}, {suffix}"
                            else: final_prep = suffix
                        
                        cursor.execute("SELECT IngredientID FROM Ingredients WHERE Name = ?", (ing_name,))
                        row = cursor.fetchone()
                        if row: ing_id = row[0]
                        else:
                            _, clean_master_unit, _ = parse_measure_advanced(unit)
                            if not clean_master_unit: clean_master_unit = get_inferred_unit(ing_name)
                            clean_master_unit = clean_master_unit[:250]
                            cursor.execute("INSERT INTO Ingredients (Name, DefaultUnit) VALUES (?, ?)", (ing_name, clean_master_unit))
                            cursor.execute("SELECT IngredientID FROM Ingredients WHERE Name = ?", (ing_name,))
                            ing_id = cursor.fetchone()[0]
                        try:
                            cursor.execute("""
                                INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit, Preparation)
                                VALUES (?, ?, ?, ?, ?)
                            """, (recipe_id, ing_id, qty, unit, final_prep))
                        except pyodbc.IntegrityError:
                            pass
                conn.commit()
            except Exception as e:
                print(f"Error importing {title}: {e}")
                continue 
    conn.close()
    print("Optimized import complete!")

if __name__ == "__main__":
    import_recipes()
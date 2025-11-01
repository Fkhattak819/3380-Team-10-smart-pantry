import React, { Component } from 'react';

// New component for the recipe modal
class RecipeModal extends Component {
  render() {
    const { recipe, onClose } = this.props;

    // Don't render anything if no recipe is selected
    if (!recipe) {
      return null;
    }

    return (
      // Fullscreen overlay
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose} // Close modal when clicking the overlay
      >
        {/* Modal Content Box */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside it
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-2xl font-semibold text-gray-800">{recipe.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-3xl font-light"
            >
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Ingredients</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>
                  {ing.qty} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
            
            <h3 className="text-lg font-medium text-gray-700 mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Modal Footer */}
          <div className="border-t p-4 text-right">
            <button
              onClick={onClose}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RecipeModal;
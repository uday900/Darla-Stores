import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ProductContext } from '../../state-management/ProductContext';


function ManageCarousel() {
  const [selectedImage, setSelectedImage] = useState(null);

  const { uploadCarouselImage, deleteCarouselImage, 
    carousels,
    setCarousels,
    fetchCarousels,
    loading,
    error,
    message,
   } = useContext(ProductContext);

   useEffect(() => {
    fetchCarousels();
   },[])
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedImage) {
      setCarousels((prev) => [...prev, selectedImage]);
      await uploadCarouselImage(selectedImage);  
    } else {
      toast.error('Please select an image');
    }
    setSelectedImage(null);
  };

  const handleDelete = (index) => {
    setCarousels((prev) => prev.filter((_, i) => i !== index));
    deleteCarouselImage(index);
  };
  function formatDateTime(isoString) {
    const date = new Date(isoString);
  
    const pad = (n) => n.toString().padStart(2, '0');
  
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Month is 0-indexed
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12
  
    return `${day}-${month}-${year} at ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
  }
  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Carousel</h2>

      {/* Upload Section */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input cursor-pointer  mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className={`${selectedImage || !loading ? 'primary-button' : 'disable-button'}`}
            disabled={!selectedImage || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {/* Carousel Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {carousels?.length === 0 && <p className="text-gray-500">No carousel images found</p>}
        {carousels?.map((img, index) => (
          <div key={index} className="relative group shadow-md rounded overflow-hidden">
            <img src={`data:image/png;base64,${img.imageData}`} alt={`Carousel ${index}`} className="w-full object-cover" />
            <span className=" bg-white text-black px-2 py-1 text-xs rounded">
              {img.imageName}

            </span>
            <button
              onClick={() => handleDelete(img.id)}
              className={`${loading ? 'disable-button px-2 py-1 text-xs rounded' : 'cursor-pointer bg-red-500 text-white px-2 py-1 text-xs rounded'}`}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
           
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageCarousel;

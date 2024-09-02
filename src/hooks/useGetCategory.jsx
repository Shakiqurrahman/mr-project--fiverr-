import { useEffect, useState } from "react";
import { useFetchGetUploadQuery } from "../Redux/api/uploadDesignApiSlice";

const useGetCategory = () => {
  const { data: uploadDesigns, error, isLoading } = useFetchGetUploadQuery();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (uploadDesigns) {
      // Process the designs to organize into folders and subfolders
      const processedFolders = uploadDesigns.reduce((acc, design) => {
        // Find or create the folder
        let folder = acc.find((item) => item.folder === design.folder);
        if (!folder) {
          folder = {
            slug: design.folder.split(" ").join("-").toLowerCase(),
            folder: design.folder,
            subFolders: [],
          };
          acc.push(folder);
        }

        // Find or create the subfolder
        let subFolder = folder.subFolders.find(
          (item) => item.subFolder === design.subFolder,
        );
        if (!subFolder) {
          subFolder = {
            slug: design.subFolder.split(" ").join("-").toLowerCase(),
            subFolder: design.subFolder,
            designs: [],
          };
          folder.subFolders.push(subFolder);
        }

        // Add the design to the appropriate subfolder
        if (!subFolder.designs.find((d) => d.id === design.id)) {
          subFolder.designs.push(design);
        }

        return acc;
      }, []);

      setCategories(processedFolders);
    }
  }, [uploadDesigns]);

  // Function to handle reordering of folders
  const handleReorder = (newFolders) => {
    setCategories(newFolders);
  };

  return { categories, error, isLoading, handleReorder };
};

export default useGetCategory;

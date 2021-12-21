const STORAGE = "storage";

let data;

if (localStorage) {
  try {
    data = JSON.parse(localStorage.getItem(STORAGE));
    if (!data) {
      data = {};
    }
  } catch (e) {}
}

const useStorage = () => {
  const saveData = () => {
    if (localStorage) {
      try {
        localStorage.setItem(STORAGE, JSON.stringify(data));
      } catch (e) {}
    }
  };

  const setStorage = (key, value) => {
    data[key] = value;
    saveData();
  };

  const getStorage = (key) => {
    return data[key];
  };

  return { getStorage, setStorage };
};

export default useStorage;

import { atom } from "recoil";

const localStorageEffect = key => ({setSelf, onSet}) => {
  if (typeof window !== 'undefined') {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  }
};

export const userState = atom({
    key: 'userState',
    default: {
      accountName: '',
      gameMode: '',
      weapon: '',
      mapName: ''
    },
    effects: [
        localStorageEffect('userState'),
    ]
});
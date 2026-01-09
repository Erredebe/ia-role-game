// Debug utility for localStorage
export class StorageDebug {
  static test() {
    try {
      console.log('Testing localStorage...');
      localStorage.setItem('test_key', 'test_value');
      const value = localStorage.getItem('test_key');
      console.log('localStorage test result:', value);
      localStorage.removeItem('test_key');
      console.log('localStorage is working!');
      return true;
    } catch (error) {
      console.error('localStorage is NOT working:', error);
      return false;
    }
  }

  static log(key: string) {
    try {
      const data = localStorage.getItem(key);
      console.log(`localStorage[${key}]:`, data ? JSON.parse(data) : null);
    } catch (error) {
      console.error(`Error reading localStorage[${key}]:`, error);
    }
  }
}

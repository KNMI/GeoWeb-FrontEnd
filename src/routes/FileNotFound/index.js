import FileNotFound from './components/FileNotFound';

// Sync route definition
export default () => ({
  path: '*',
  components : {
    'mainViewport': FileNotFound
  }
});

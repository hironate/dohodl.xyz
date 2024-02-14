import Layout from '../design-System/Organisms/Layout';
import '../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../redux/store';
function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}

export default MyApp;

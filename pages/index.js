import withRedux from 'next-redux-wrapper';

import configureStore from '../redux/createStore';
import withApp from '../components/withApp';

import PublishedTemplate from '../components/PublishedTemplate';

export default withRedux(configureStore)(withApp(PublishedTemplate));

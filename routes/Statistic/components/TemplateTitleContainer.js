import { connect } from 'react-redux';
import Title from '../../../components/Title';
import {
  fetchSingleTemplateRequest,
  getTemplateInfo,
} from '../modules/singleTemplate';

const mapStateToProps = state => ({
  title: getTemplateInfo(state).title,
});

const mapDispatchToProps = dispatch => ({
  fetchInfoRequestAction: (id) => {
    dispatch(fetchSingleTemplateRequest(id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Title);

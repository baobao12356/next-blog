import React, {Component} from 'react';
import {connect} from 'react-redux'
import {
  Layout, Menu, Breadcrumb, Row, Col, BackTop, Card, Form,
  Input, Tooltip, Cascader, Select, Checkbox, Button,
  AutoComplete, List, Avatar, Icon, Divider
} from 'antd';
import 'whatwg-fetch'
import Head from 'next/head';
//组件
import ArticleTitle from '../../components/ArticleTitle';
import PrevNextPage from '../../components/PrevNextPage';
import Comments from '../../components/Comments';
//其他
import {getDetailUrl, getCommentsUrl,getLastIdUrl,getNextIdUrl} from '../../config';
import {COMMON_TITLE} from '../../config/constantsData';
import {getHtml, OldTime} from '../../until';
//定义
const {Content} = Layout;


class Detail extends Component {
  constructor(props) {
    super(props);
    this.state={
      articleID:''
    }
  }
  componentWillMount(){
    const {blogData = []} = this.props;
    let {id:articleID} = blogData[0] || {};
    this.setState({
      articleID
    })
  }
  render() {
    //接口
    let {blogData = [], commentsData = [],getCommentsData=[],lastIdData=[],nextIdData=[]} = this.props;
    let {articleID} = this.state;
    const {content = '', createTime = '',title='',url=''} = blogData[0] || {};

    commentsData=[...commentsData,...getCommentsData]
      .filter(v=>v.a_id===articleID)
      .sort((a,b)=>b.createTime-a.createTime)


    return (
      <div className="detail">
        <Head>
          <title>{title}{COMMON_TITLE}</title>
        </Head>
        <Layout>
          <Content style={{padding: '0 50px'}}>
            <div style={{background: '#fff', padding: 24, minHeight: 380}}>
              <ArticleTitle detailArticle={blogData[0]}/>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    createTime > OldTime ?
                      marked(getHtml(decodeURIComponent(content), createTime), {breaks: true})
                      : getHtml(decodeURIComponent(content), createTime)
                }}
              ></div>
              <PrevNextPage dataSource={{url,lastIdData,nextIdData}}></PrevNextPage>
            </div>
            <Comments dataSource={{commentsData,articleID}}></Comments>
          </Content>
        </Layout>
      </div>
    );
  }
}

Detail.getInitialProps = async function (context) {
  const {id} = context.query
  let queryStrObj = {id};
  const blog = await fetch(getDetailUrl(queryStrObj))
  const comments = await fetch(getCommentsUrl(queryStrObj))
  const lastId = await fetch(getLastIdUrl(queryStrObj))
  const nextId = await fetch(getNextIdUrl(queryStrObj))

  const blogData = await blog.json()
  const commentsData = await comments.json()
  let lastIdData ,nextIdData
  try {
    lastIdData = await lastId.json()
  } catch (e) {
    lastIdData = []
  }
  try {
    nextIdData = await nextId.json()
  } catch (e) {
    nextIdData =[]
  }


  return {blogData, commentsData,lastIdData,nextIdData}
}
const mapStateToProps = state => {
  const {getCommentsData} = state
  return {getCommentsData};
}
const WrappedRegistrationForm = Form.create()(Detail);
export default connect(mapStateToProps)(WrappedRegistrationForm);
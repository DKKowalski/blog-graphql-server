const graphql = require("graphql");
const axios = require("axios");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList,
} = graphql;

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    posts: {
      type: new GraphQLList(PostType),
      resolve(parentValue, args) {
        console.log(parentValue);
        return axios
          .get(`http://localhost:3000/posts?userId=${parentValue.id}`)
          .then((response) => response.data);
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    likes: { type: GraphQLInt },
    unlikes: { type: GraphQLInt },
    banner: { type: GraphQLString },
    author: {
      type: AuthorType,

      resolve(parentValue, args) {
        // console.log(parentValue, args);
        return axios
          .get(`http://localhost:3000/authors/${parentValue.userId}`)
          .then((response) => response.data);
      },
    },

    comments: {
      type: new GraphQLList(CommentType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/comments?postId=${parentValue.id}`)
          .then((response) => response.data);
      },
    },
  }),
});

//comments schema
const CommentType = new GraphQLObjectType({
  name: "Comments",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    body: { type: GraphQLString },
    post: {
      type: PostType,
      resolve(parentValue, args) {
        console.log(parentValue, args);
        return axios
          .get(`http://localhost:3000/posts/${parentValue.postId}`)
          .then((response) => response.data);
      },
    },
    replies: {
      type: new GraphQLList(ReplyType),
      resolve(parentValue, args) {
        console.log(parentValue);
        return axios
          .get(`http://localhost:3000/replies?commentId=${parentValue.id}`)
          .then((response) => response.data);
      },
    },
  }),
});

// replies to comments schema
const ReplyType = new GraphQLObjectType({
  name: "Replies",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    body: { type: GraphQLString },
    commentId: { type: GraphQLString },
  }),
});

//Queries
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    authors: {
      type: AuthorType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/authors/${args.id}`)
          .then((resp) => resp.data);
      },
    },

    readPost: {
      type: PostType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/posts/${args.id}`)
          .then((response) => response.data);
      },
    },

    readComment: {
      type: CommentType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/comments/${args.id}`)
          .then((response) => response.data);
      },
    },

    //read replies
    readReply: {
      type: ReplyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/replies/${args.id}`)
          .then((response) => response.data);
      },
    },
  },
});

//mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //createPost
    createPost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        likes: { type: GraphQLInt },
        unlikes: { type: GraphQLInt },
        banner: { type: GraphQLString },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(
        parentValue,
        { id, title, body, authorId, likes = 0, unlikes = 0, banner = "" }
      ) {
        return axios
          .post(`http://localhost:3000/posts`, {
            id,
            title,
            body,
            authorId,
            likes,
            unlikes,
            banner,
          })
          .then((response) => response.data);
      },
    },
    //updatePost
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        body: { type: GraphQLString },
        likes: { type: GraphQLInt },
        unlikes: { type: GraphQLInt },
        banner: { type: GraphQLString },
        authorId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios
          .patch(`http://localhost:3000/posts/${args.id}`, args)
          .then((response) => response.data);
      },
    },
    // deletePost: {},
    deletePost: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parentValue, args) {
        return axios
          .delete(`http://localhost:3000/posts/${args.id}`)
          .then((response) => response.data);
      },
    },

    // commentPost: {},
    commentPost: {
      type: CommentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, { id, name, email, body, postId }) {
        return axios.post(`http://localhost:3000/comments`, {
          id,
          name,
          email,
          body,
          postId,
        });
      },
    },

    // deleteComment: {},
    deleteComment: {
      type: CommentType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parentValue, args) {
        return axios
          .delete(`http://localhost:300/comments/${args.id}`)
          .then((response) => response.data);
      },
    },

    // replyCommment: {},
    reply: {
      type: ReplyType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        commentId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, { id, name, email, body, commentId }) {
        return axios
          .post(`http://localhost:3000/replies`, {
            id,
            name,
            email,
            body,
            commentId,
          })
          .then((response) => response.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
});

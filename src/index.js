const Koa = require('koa')
const mount = require('koa-mount')
const { graphqlHTTP } = require('koa-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = new Koa()

const authors = []
const books = []

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: 'See all books',
      resolve: () => books
    },
    book: {
      type: BookType,
      description: 'See a book',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        return books.find(book => book.id === args.id)
      }
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'See all authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'See an author',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        return authors.find(author => author.id === args.id)
      }
    }
  })
})
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addBook: {
      type: GraphQLString,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!authors.find(author => author.id === args.id)) return 'Author Id inexistent'
        const newBook = { id: books.length + 1, name: args.name, authorId: args.authorId }
        books.push(newBook)
        return 'Book added'
      }
    },
    updateBook: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        authorId: { type: GraphQLInt }
      },
      resolve: (_, args) => {
        if (!books.find(book => book.id === args.id)) return 'Book Id inexistent'
        if (!authors.find(author => author.id === args.id)) return 'Author Id inexistent'
        const actualBook = books.find(book => book.id === args.id)
        if (args.name) actualBook.name = args.name
        if (args.authorId) actualBook.authorId = args.authorId
        return 'Book Updated'
      }
    },
    removeBook: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!books.find(book => book.id === args.id)) return 'Book Id inexistent'
        const removingBook = books.find(book => book.id === args.id)
        books.splice(books.indexOf(removingBook), 1)
        return 'Book removed'
      }
    },
    addAuthor: {
      type: GraphQLString,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args) => {
        const newAuthor = { id: authors.length + 1, name: args.name }
        authors.push(newAuthor)
        return 'Author added'
      }
    },
    updateAuthor: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString }
      },
      resolve: (_, args) => {
        if (!authors.find(author => author.id === args.id)) return 'Author Id inexistent'
        const actualAuthor = authors.find(author => author.id === args.id)
        actualAuthor.name = args.name
        return actualAuthor
      }
    },
    removeAuthor: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!authors.find(author => author.id === args.id)) return 'Author Id inexistent'
        const removingAuthor = authors.find(author => author.id === args.id)
        authors.splice(authors.indexOf(removingAuthor), 1)
        return 'Author removed'
      }
    }
  })
})

const BookType = new GraphQLObjectType({
  name: 'bookType',
  description: 'Schema for book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId)
      }
    }
  })
})
const AuthorType = new GraphQLObjectType({
  name: 'AuthorType',
  description: 'Schema for author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id)
      }
    }
  })
})

const schema123 = new GraphQLSchema({ query: queryType, mutation: mutationType })

app.use(
  mount(
    '/graphql',
    graphqlHTTP({
      schema: schema123,
      graphiql: true
    })
  )
)

app.listen(4000)
console.log('Running a GraphQL API server at http://localhost:4000/graphql')

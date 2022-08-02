const graphql = require("graphql")
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const app = express()
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLNonNull
} = require('graphql')



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
        },
    })
})
const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (_, args) => {
                const newBook = {id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(newBook)
                return newBook
            }
        },
        updateBook: {
            type: BookType,
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString },
                authorId: { type: GraphQLInt },
            },
            resolve: (_, args) => {
                const actualBook = books.find(book => book.id === args.id)
                if (args.name) actualBook.name = args.name
                if (args.authorId) actualBook.authorId = args.authorId
                return actualBook
            }
        },
        removeBook: {
            type: GraphQLString,
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (_, args) => {
                const removingBook = books.find(book => book.id === args.id)
                books.splice(books.indexOf(removingBook), 1)
                return "Book removed"
            }
        },
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (_, args) => {
                const newAuthor = {id: authors.length + 1, name: args.name}
                authors.push(newAuthor)
                return newAuthor
            }
        },
        updateAuthor: {
            type: AuthorType,
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString },
            },
            resolve: (_, args) => {
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
                const removingAuthor = authors.find(author => author.id === args.id)
                authors.splice(authors.indexOf(removingAuthor), 1)
                return "Author removed"
            }
        },
    })
})

const BookType = new GraphQLObjectType ({
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






const schema = new GraphQLSchema({query: queryType, mutation: mutationType})
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(4000)
console.log('Running a GraphQL API server at http://localhost:4000/graphql')
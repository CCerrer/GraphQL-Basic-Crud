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

const creators = [
  { id: 1, name: 'Rogerio1', adress: 'rua exemplo 1' },
  { id: 2, name: 'Rogerio2', adress: 'rua exemplo 2' },
  { id: 3, name: 'Rogerio3', adress: 'rua exemplo 3' }
]
const bees = [
  { id: 1, name: 'Abelha generica 1', creatorId: 1, boxes: 5, production: 2 },
  { id: 2, name: 'Abelha generica 2', creatorId: 1, boxes: 3, production: 8 },
  { id: 3, name: 'Abelha generica 3', creatorId: 2, boxes: 1, production: 1 }
]

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    bees: {
      type: new GraphQLList(BeeType),
      description: 'See all bees',
      resolve: () => bees
    },
    bee: {
      type: BeeType,
      description: 'See a bee',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        return bees.find(bee => bee.id === args.id)
      }
    },
    creators: {
      type: new GraphQLList(CreatorType),
      description: 'See all creators',
      resolve: () => creators
    },
    creator: {
      type: CreatorType,
      description: 'See an creator',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        return creators.find(creator => creator.id === args.id)
      }
    }
  })
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addBee: {
      type: GraphQLString,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        creatorId: { type: GraphQLNonNull(GraphQLInt) },
        boxes: { type: GraphQLNonNull(GraphQLInt) },
        production: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!creators.find(creator => creator.id === args.creatorId)) return 'Creator Id inexistent'
        const newBee = { id: bees.length + 1, name: args.name, creatorId: args.creatorId, boxes: args.boxes, production: args.production }
        bees.push(newBee)
        return 'Bee added'
      }
    },
    updateBee: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        creatorId: { type: GraphQLInt },
        boxes: { type: GraphQLNonNull(GraphQLInt) },
        production: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!bees.find(bee => bee.id === args.id)) return 'Bee Id inexistent'
        if (!creators.find(creator => creator.id === args.id)) return 'creator Id inexistent'
        const actualBee = bees.find(bee => bee.id === args.id)
        if (args.name) actualBee.name = args.name
        if (args.creatorId) actualBee.creatorId = args.creatorId
        if (args.boxes) actualBee.boxes = args.boxes
        if (args.production) actualBee.production = args.production
        return 'Bee Updated'
      }
    },
    removeBee: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!bees.find(bee => bee.id === args.id)) return 'Bee Id inexistent'
        const removingBee = bees.find(bee => bee.id === args.id)
        bees.splice(bees.indexOf(removingBee), 1)
        return 'Bee removed'
      }
    },
    addCreator: {
      type: GraphQLString,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        adress: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args) => {
        const newCreator = { id: creators.length + 1, name: args.name, adress: args.adress }
        creators.push(newCreator)
        return 'Creator added'
      }
    },
    updatecreator: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        adress: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, args) => {
        if (!creators.find(creator => creator.id === args.id)) return 'creator Id inexistent'
        const actualCreator = creators.find(creator => creator.id === args.id)
        if (args.name) actualCreator.name = args.name
        if (args.adress) actualCreator.adress = args.adress
        return actualCreator
      }
    },
    removecreator: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => {
        if (!creators.find(creator => creator.id === args.id)) return 'creator Id inexistent'
        const removingcreator = creators.find(creator => creator.id === args.id)
        creators.splice(creators.indexOf(removingcreator), 1)
        return 'creator removed'
      }
    }
  })
})

const BeeType = new GraphQLObjectType({
  name: 'BeeType',
  description: 'Schema for bees',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    creatorId: { type: GraphQLNonNull(GraphQLInt) },
    boxes: { type: GraphQLNonNull(GraphQLInt) },
    production: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'liter per year'
    },
    creator: {
      type: CreatorType,
      resolve: (bee) => {
        return creators.find(creator => creator.id === bee.creatorId)
      }
    }
  })
})
const CreatorType = new GraphQLObjectType({
  name: 'CreatorType',
  description: 'Schema for creators',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    adress: { type: GraphQLNonNull(GraphQLString) },
    bees: {
      type: GraphQLList(BeeType),
      resolve: (creator) => {
        return bees.filter(bee => bee.creatorId === creator.id)
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

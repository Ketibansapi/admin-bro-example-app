const AdminBro = require('admin-bro')
const AdminBroMongoose = require('admin-bro-mongoose')
const AdminBroSequelizejs = require('admin-bro-sequelizejs')
const sequelize = require('sequelize')
AdminBro.registerAdapter(AdminBroMongoose)
AdminBro.registerAdapter(AdminBroSequelizejs)

const SequelizeDb = require('../sequelize/models')

const menu = {
  default: { name: 'Default Resources', icon: 'fas fa-ad' },
  customized: { name: 'Customized Resources', icon: 'fas fa-marker' }
}

const user = require('./resources/user')
const page = require('./resources/page')
const blogPost = require('./resources/blog-post')
const article = require('./resources/article')

const UserModel = require('../mongoose/user-model')
const PageModel = require('../mongoose/page-model')
const CategoryModel = require('../mongoose/category-model')
const CommentModel = require('../mongoose/comment-model')

module.exports = {
  resources: [
    { resource: CommentModel, options: { parent: menu.default } },
    { resource: CategoryModel, options: { parent: menu.default } },
    { resource: SequelizeDb.sequelize.models.User, options: { parent: menu.default } },
    { resource: SequelizeDb.sequelize.models.FavouritePlace, options: { parent: menu.default } },
    { resource: UserModel, options: { parent: menu.customized, ...user } },
    { resource: PageModel, options: { parent: menu.customized, ...page } },
    { resource: require('../mongoose/blog-post-model'), options: { parent: menu.default, ...blogPost } },
    { resource: require('../mongoose/article-model'), options: { parent: menu.customized, ...article } },
  ],
  dashboard: {
    handler: async (request, response, data) => {
      const categories = await CategoryModel.find({}).limit(5)
      return {
        usersCount: await UserModel.countDocuments(),
        pagesCount: await PageModel.countDocuments(),
        categories: await Promise.all(categories.map(async c => {
          const comments = await CommentModel.countDocuments({ categoryId: c._id })
          return {
            title: c.title,
            comments,
            _id: c._id,
          }
        }))
      }
    },
    component: AdminBro.require('./components/dashboard'),
  },
}

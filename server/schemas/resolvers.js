const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("./../models");
const { signToken } = require("./../utils/auth");

const resolvers = {
  Query: {
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate("savedBooks");
    },
  },

  Mutation: {
    creatUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect Credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { userId, bookId }, context) => {
      if (context.user) {
        return User.findByOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    deleteBook: async (parent, { userId, bookId }, context) => {
      if (context.user) {
        return Book.findByOneAndUpdate(
          { _id: userId },
          {
            $pull: {
              savedBooks: {
                _id: bookId,
              },
            },
          },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;

const mongoose = require("mongoose");
const { describe, before } = require("mocha");
const AuthController = require("../controllers/authController");
const { expect } = require("chai");
const User = require("../models/user");
const {stub} = require("sinon");
describe("Auth Controller", function () {
  before(function (done) {
    mongoose
      .connect("mongodb://localhost:27017/test-messages")
      .then(() => {
        const user = new User({
          name: "Test",
          password: "password",
          email: "test@test.com",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });

        return user.save();
      })
      .then(() => {
        done();
      });
  });


  it('should throw an error with code 500 if accessing the database fails', function(done) {
    stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'tester'
      }
    };

    AuthController.login(req, {}, () => {}).then(result => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });

    User.findOne.restore();
  });

  it("should send responds with a valid user status for and existing user", function (done) {
    const req = { userId: "5c0f66b979af55031b34728a" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };

    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new!");
      done();
    });
  });


  after(function (done) {
    User.deleteMany({}).then(() => {
      return mongoose.disconnect();
    }).then(()=> done());
  });
});

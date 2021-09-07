const { query, response } = require('express');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var axios = require('axios')

var base_url = axios.create({
    baseURL: 'http://localhost:8081/test'
});

function callGet() {
    return new Promise(function (resolve, rejects) {
        base_url.get('/get')
            .then(function (response) {
                console.log(response.data);
                resolve(response.data);
            })
            .catch(error => {
                rejects(error);
            });
    });
}

function callUpdate(id, new_id) {
    console.log('do update...%s, %s', id, new_id);
    return new Promise((resolve, rejects) => {
        base_url.get('/update', { params: { 'id': id, 'new_id': new_id } })
            .then(function (response) {
                resolve(response.data);
            })
            .catch((error) => {
                rejects(error);
            });
    });
}

var schema = buildSchema(`
    type Test {
        id: Int
        name: String
    }

    type Update {
        suc: Boolean
    }

    type Query {
        getTest : [Test]
    }
    type Mutation {
        updateTest(id: Int!, new_id: Int!): Update
    }
`);

var root = {
    updateTest({ id, new_id }) {
        return callUpdate(id, new_id)
            .then((data => data))
            .catch((error) => {
                console.log("error: " + error)
            });
    },
    getTest: () => {
        return callGet()
            .then((data => data))
            .catch((error) => {
                console.log("error: " + error);
            });
    },
};

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
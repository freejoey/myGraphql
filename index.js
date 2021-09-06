const { query, response } = require('express');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var axios = require('axios')

var base_url = axios.create({
    baseURL:'http://localhost:8081/test'
});

function callGet(cb) {
    base_url.get('/get').then(function (response){
        //response 就是请求url 返回的内容
        // console.log(response);
        cb(response.data);
    });
}

function callUpdate(id, new_id, cb) {
    base_url.get('/update', {params: {'id':id, 'new_id': new_id}})
    .then(function (response){
        //response 就是请求url 返回的内容
        // console.log(response);
        cb(response.data);
    });
}

class Test {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

var schema = buildSchema(`
    type Test {
        id: Int
        name: String
    }

    type Query {
        getTest : Test
        updateTest(id: Int!, new_id: Int!): Boolean
    }
`);
 
var root = { 
    updateTest({id, new_id}){
        console.log('do update...%s, %s', id, new_id);
        callUpdate(id, new_id, function cb(r) {
            console.log(r);
        });
        return true;
    },
    getTest(){
        callGet(function cb(r) {
            console.log(r);
        });
        return new Test(123, 'mat');
    },
};
 
var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
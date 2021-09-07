const { query, response } = require('express');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var axios = require('axios')

var base_url = axios.create({
    baseURL:'http://localhost:8081/test'
});

function callGet() {
    return new Promise(function(resolve, rejects){
        base_url.get('/get').then(function (response){
            console.log(response.data);
            resolve(response.data);
        });
    });
}

function callUpdate(id, new_id) {
    console.log('do update...%s, %s', id, new_id);
    return new Promise((resolve, rejects)=>{
        base_url.get('/update', {params: {'id':id, 'new_id': new_id}})
        .then(function (response){
            var data = response.data;
            if (data && 1==data.changedRows) {
                resolve(true);
                return;
            }
            resolve(false);
        });
    });
}

class Test {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Result {
    constructor(suc) {
        this.suc = suc;
    }
}

var schema = buildSchema(`
    type Test {
        id: Int
        name: String
    }
    type Result {
        suc: Boolean
    }

    type Query {
        getTest : [Test]
        updateTest(id: Int!, new_id: Int!): Result
    }
`);
 
var root = { 
    updateTest({id, new_id}){
        var r = callUpdate(id, new_id).then((data=>data));
        return new Result(r);
    },
    getTest:()=>{
        return callGet().then((data=>data));
    },
};
 
var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
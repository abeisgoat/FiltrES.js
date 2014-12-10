var assert = require("assert"),
    ElasticSearchClient = require("elasticsearchclient"),
    filtres = require('../filtres.js');

var serverOptions = {
        host: 'localhost',
        port: 9200,
    }, 
    esc = new ElasticSearchClient(serverOptions),
    userData = {
      "abe": {
        "favorites": {
          "color": "purple"
        },
        "firstname": "abraham",
        "height": 73,
        "lastname": "haskins",
      },
      "obie": {
        "favorites": {
          "color": "blue"
        },
        "firstname": "obie",
        "height": 70,
        "lastname": "fernandez",
      },
      "sanni": {
        "favorites": {
          "color": "green"
        },
        "firstname": "ome",
        "height": 100,
        "lastname": "sanni",
      },
      "tim": {
        "favorites": {
          "color": "blue"
        },
        "firstname": "timothy",
        "height": 73,
        "lastname": "jackson"
      }
    };

describe('filtres', function () {
    beforeEach(function (done) {
        var success = 0,
            finish = function () {
                if (success == Object.keys(userData).length) done();
            };
        Object.keys(userData).forEach(function (userId) {
            esc.index("filtres", "user", userData[userId], userId)
                .on('data', function(data) {
                    success++;
                    finish();
                })
                .exec()
        });
    });
    describe('#compile()', function () {
        it('should return 2 users for "height == 73"', function (done) {
            var query = filtres.compile("height == 73");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(['abe', 'tim']));
                done();
            });
        });

        it('should return 2 users for "height != 73"', function (done) {
            var query = filtres.compile("height != 73");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(['obie', 'sanni']));
                done();
            });
        });

        it('should return 4 users for "height > 0"', function (done) {
            var query = filtres.compile("height > 0");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["abe", "obie", "sanni", "tim"]));
                done();
            });
        });

        it('should return 0 users for "height < 0"', function (done) {
            var query = filtres.compile("height < 0");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users());
                done();
            });
        });

        it('should return 1 users for "height < 73"', function (done) {
            var query = filtres.compile("height < 73");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(['obie']));
                done();
            });
        });

        it('should return 1 users for "height > 73"', function (done) {
            var query = filtres.compile("height > 73");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(['sanni']));
                done();
            });
        });

        it('should return 3 users for "height >= 73"', function (done) {
            var query = filtres.compile("height >= 73");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(['abe', 'tim', 'sanni']));
                done();
            });
        });

        it('should return 1 user for "height <= 73"', function (done) {
            var query = filtres.compile("height <= 73");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(['abe', 'tim', 'obie']));
                done();
            });
        });

        it('should return 0 users for "height < 73 and height > 99"', function (done) {
            var query = filtres.compile("height < 73 and height > 99");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users());
                done();
            });
        });

        it('should return 2 users for "height < 73 or height > 99"', function (done) {
            var query = filtres.compile("height < 73 or height > 99");
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["obie", "sanni"]));
                done();
            });
        });

        it('should return 2 users for "firstname ~= \"o.+\""', function (done) {
            var query = filtres.compile('firstname ~= "o.+"');
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["obie", "sanni"]));
                done();
            });
        });

        it('should return 2 users for "firstname ~!= \"o.+\""', function (done) {
            var query = filtres.compile('firstname ~!= "o.+"');
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["abe", "tim"]));
                done();
            });
        });

        it('should return 1 users for "favorites.color == \"green\""', function (done) {
            var query = filtres.compile('favorites.color == "green"');
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["sanni"]));
                done();
            });
        });

        it('should return 3 users for "not (favorites.color == \"green\")"', function (done) {
            var query = filtres.compile('not (favorites.color == "green")');
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["tim", "obie", "abe"]));
                done();
            });
        });

        it('should return 3 users for "(not (height < 72 and height > 74) and (firstname ~= \"a.raham\" or firstname == \"timothy\")) or favorites.color == \"green\""', function (done) {
            var query = filtres.compile('(not (height < 72 and height > 74) and (firstname ~= "a.raham" or firstname == "timothy")) or favorites.color == "green"');
            esc.search("filtres", "user", query, function (err, data) {
                var results = getUsers(data);
                assert.deepEqual(results, users(["tim", "abe", "sanni"]));
                done();
            });
        });
    });
});

function getUsers(rawData) {
    var data = JSON.parse(rawData),
        results = {};

    data.hits.hits.forEach(function (result) {
        results[result._id] = true;
    });

    return results
}

function users(users) {
    var userObj = {};
    (users || []).forEach(function (user) {
        userObj[user] = true;
    });
    return userObj;
};
'use strict';

function writeFile (filepath, obj) {
    const fs = require('fs-extra'),
        path = require('path'),
        Q = require('q'),
        dir = path.dirname(filepath),
        deferred = Q.defer();

    fs.ensureDir(dir, mkdirErr => {
        if (mkdirErr) {
            deferred.reject(mkdirErr);
        }
        else {
            fs.writeFile(filepath, JSON.stringify(obj), err => {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(filepath);
                }
            });
        }
    });

    return deferred.promise;
}

function readFile (filepath) {
    const Q = require('q'),
        deferred = Q.defer(),
        fs = require('fs');

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') {
            deferred.resolve(null);
        }
        else if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(JSON.parse(data));
        }
    });

    return deferred.promise;
}

const Stub = {
    create: function (config) {
        const helpers = require('../util/helpers'),
            stub = helpers.clone(config || {});

        stub.responses = stub.responses || [{ is: {} }];

        stub.addResponse = () => {};

        stub.nextResponse = () => {};

        stub.deleteResponsesMatching = () => {};

        return stub;
    }
};

function create (config) {
    function first () {}

    function add (stub) {
        const headerFile = `${config.imposterDir}/imposter.json`,
            stubDefinition = {
                predicates: stub.predicates || [],
                meta: {
                    responseFiles: [],
                    orderWithRepeats: [],
                    nextIndex: 0
                }
            },
            responses = stub.responses || [],
            Q = require('q'),
            promises = [];

        return readFile(headerFile).then(imposter => {
            imposter.stubs = imposter.stubs || [];
            const stubDir = `stubs/${imposter.stubs.length}`;

            for (let i = 0; i < responses.length; i += 1) {
                const responseFile = `${stubDir}/responses/${i}.json`;
                stubDefinition.meta.responseFiles.push(responseFile);
                stubDefinition.meta.orderWithRepeats.push(i);
                promises.push(writeFile(`${config.imposterDir}/${responseFile}`, responses[i]));
            }

            imposter.stubs.push(stubDefinition);
            promises.push(writeFile(headerFile, imposter));
            return Q.all(promises);
        });
    }

    function insertBefore () {}

    function insertAtIndex () {
    }

    function overwriteAll () {
    }

    function overwriteAtIndex () {
    }

    function deleteAtIndex () {
    }

    function getAll () {
    }

    return {
        count: () => 0,
        first,
        add,
        insertBefore,
        insertAtIndex,
        overwriteAll,
        overwriteAtIndex,
        deleteAtIndex,
        getAll,
        newStub: Stub.create
    };
}

module.exports = { create };
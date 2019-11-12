const api_request = require('./data_fetcher').api_request;
class Dict {
    constructor() {
    }
    definition (word) {
        let params = 'word/' + word + '/definitions';
        return new Promise((resolve, reject) => {
            api_request(params, 'GET', null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (result.error) {
                        resolve({'definitions': result.error})
                    } else {
                        result = result.map(function (item) {
                            return item.text;
                        });
                    }
                    resolve({'definitions': result});
                }
            })
        });
    }

    synonyms (word) {
        let params = 'word/' + word + '/relatedWords';
        return new Promise((resolve, reject) => {
            api_request(params, 'GET', null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (result.error) {
                        resolve({'synonyms': result.error})
                    } else {
                        result = result.filter(function (item) {
                            return item.relationshipType === 'synonym';
                        });
                        if (result.length > 0) {
                            resolve({'synonyms' : result[0].words})
                        } else {
                            resolve({'synonyms': result});
                        }
                    }
                }
            })
        });
    }

    antonyms (word) {
        let params = 'word/' + word + '/relatedWords';
        return new Promise((resolve, reject) => {
            api_request(params, 'GET', null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (result.error) {
                        resolve({'antonyms': result.error})
                    } else {
                        result = result.filter(function (item) {
                            return item.relationshipType === 'antonym';
                        });
                        if (result.length > 0) {
                            resolve({'antonyms' : result[0].words})
                        } else {
                            resolve({'antonyms': result});
                        }
                    }
                }
            })
        });
    }

    examples (word) {
        let params = 'word/' + word + '/examples';
        return new Promise((resolve, reject) => {
            api_request(params, 'GET', null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (result.error) {
                        resolve({'examples': result.error})
                    } else {
                        result = result.examples;
                        result = result.map(function (item) {
                            return item.text;
                        });
                    }
                    resolve({ 'examples' : result});
                }
            })
        });
    }

    word_of_the_day () {
        let params = 'words/RandomWord';
        return new Promise((resolve, reject) => {
            api_request(params, 'GET', null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }
}

class Word {
    constructor (name, properties) {
        this.name = name;
        this.definitions = properties[0]['definitions'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.synonyms = properties[1]['synonyms'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.antonyms = properties[2]['antonyms'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.examples = properties[3]['examples'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.get_first_info();
    }

    get_properties () {
        return { 'defintions' : Object.keys(this.definitions),
            'synonyms' : Object.keys(this.synonyms),
            'antonyms' : Object.keys(this.antonyms),
            'examples' : Object.keys(this.examples)
        };
    }

    get_first_info () {
        let data = {};
        data['definition'] = this.get_first_unvisited(this.definitions);
        let synonym = this.get_first_unvisited(this.synonyms);
        if (!synonym) {
            synonym = this.get_first_unvisited(this.antonyms);
            data['antonym'] = synonym
        } else {
            data['synonym'] = synonym;
        }

        this.first_info = data;
    }
    get_first_unvisited (hash) {
        for (let key in hash) {
            if (!hash[key]) {
                hash[key] = true;
                return key;
            }
        }
    }

    get_next_hint () {
        let rand = parseInt(Math.random()*100, 10);
        let modulo = rand % 4;
        let result = this.get_random_property(modulo);
        if (result[1] === undefined) {
            this.get_next_hint();
        } else {
            return result;
        }
    }

    get_random_property (index) {
        switch (index) {
            case 0:
                return ['jumbled', this.jumble(this.name)];
            case 1:
                return ['synonym', this.get_first_unvisited(this.synonyms)];
            case 2:
                return ['antonym', this.get_first_unvisited(this.antonyms)];
            case 3:
                return ['definition', this.get_first_unvisited(this.definitions)];
        }
    }

    jumble (word){
        let shuffledWord = '';
        word = word.split('');
        while (word.length > 0) {
            shuffledWord +=  word.splice(word.length * Math.random() << 0, 1);
        }
        return shuffledWord;
    }
    is_correct (word) {
        return (this.name === word || Object.keys(this.synonyms).includes(word));
    }

}

exports.Dict = Dict;
exports.Word = Word;

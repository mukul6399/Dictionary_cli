const api_request = require('./data_fetcher').api_request;
class Dict {
    constructor() {
    }

    fetch_property (word, property) {
        let kind = property;
        if (property === 'synonym' || property === 'antonym') {
            kind = 'relatedWords';
        }
        let params = 'word/' + word + '/' + kind;
        return new Promise((resolve, reject) => {
            api_request(params, 'GET', null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (result.error) {
                        result = result.error;
                    } else {
                        if ( property === 'synonym' || property === 'antonym') {
                            result = result.filter(function (item) {
                                return item.relationshipType === property;
                            });
                            if (result.length > 0) {
                                result = result[0].words;
                            }
                        } else if (property === 'definitions') {
                            result = result.map(function (item) {
                                return item.text;
                            });

                        } else if (property === 'examples') {
                            result = result.examples;
                            result = result.map(function (item) {
                                return item.text;
                            });
                        }
                    }
                    resolve({ [property] : result});
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
        this.synonym = properties[1]['synonym'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.antonym = properties[2]['antonym'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.examples = properties[3]['examples'].reduce(function(map, obj) { map[obj] = false;return map;}, {});
        this.get_first_info();
    }

    get_properties () {
        return { 'defintions' : Object.keys(this.definitions),
            'synonym' : Object.keys(this.synonym),
            'antonym' : Object.keys(this.antonym),
            'examples' : Object.keys(this.examples)
        };
    }

    get_first_info () {
        let data = {};
        data['definition'] = this.get_first_unvisited(this.definitions);
        let synonym = this.get_first_unvisited(this.synonym);
        if (!synonym) {
            synonym = this.get_first_unvisited(this.antonym);
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
                return ['synonym', this.get_first_unvisited(this.synonym)];
            case 2:
                return ['antonym', this.get_first_unvisited(this.antonym)];
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
        let keys = [];
        for (let key in this.synonym) {
            if (!this.synonym[key]) {
                keys.push(key);
            }
        }
        return (this.name === word || keys.includes(word));
    }

}

exports.Dict = Dict;
exports.Word = Word;

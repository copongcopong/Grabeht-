TPL = {

    // Hash of preloaded templates for the app
    templates:{},
    ctemplates:{},


    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment. All the template files should be
    // concatenated in a single file.
    loadTemplates:function (names, callback) {

        var that = this;

        var loadTemplate = function (index) {
            var name = names[index];
            var nocache = '';
			if(NOCACHETEMPLATE == undefined) NOCACHETEMPLATE = false;
            if(NOCACHETEMPLATE !== undefined && NOCACHETEMPLATE === true) {
                nocache = '?_=' + new Date().getTime();
            }
            console.log('Loading template: ' + name, NOCACHETEMPLATE, nocache);

            $.get('tpl/' + name + '.html' + nocache, function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        };

        loadTemplate(0);
    },

    groupLoadTemplates:function (names, callback) {

        var nocache = '';
        if(NOCACHETEMPLATE !== undefined && NOCACHETEMPLATE === true) {
            nocache = '&_=' + new Date().getTime();
        }
        var that = this;
        var files = names.join(",");
        console.log('Loading template: ' + files, NOCACHETEMPLATE, nocache);

        $.getJSON('tpl/combined.php?files=' + files + nocache, function (jsondata) {
            console.log(jsondata);
            $.when($.extend(that.templates, jsondata)).done(callback);
        });


    },
    // Get template by name from hash of preloaded templates
    get:function (name, wrap) {
        var t = this.templates[name];
        var btpl = false;
        if(!_.isUndefined(wrap)) {
            console.log('XXXX', wrap);
            var id = wrap[0];
            var att = '';
            if(wrap[1] !== undefined) att = wrap[1];

            btpl = '<div id="'+id+'"'+'>' + t + '</div>';
        } else {
            btpl = t;
        }

        return btpl;
    },

    //fork of get, uses callback approach, for lazy loading templates;
    //uses compiled template for the callback;
    use: function(name, callback) {
        var t = this.templates[name];
        var dfd = new $.Deferred();
        if(_.isUndefined(t)) {
            var nocache = '';
			if(typeof NOCACHETEMPLATE == 'undefined') NOCACHETEMPLATE = false;
            if(NOCACHETEMPLATE !== undefined && NOCACHETEMPLATE === true) {
                nocache = '?_=' + new Date().getTime();
            }
            that = this;
            //console.log("USE", name);
            $.get('tpl/' + name + '.html' + nocache, function (data) {
                // console.log('USE R', data);
                that.templates[name] = data;
                that.ctemplates[name] = _.template(that.templates[name]);
                callback(that.ctemplates[name]);
                dfd.resolve();
            });

        } else {
            var c = this.ctemplates[name];
            if(_.isUndefined(c)) this.ctemplates[name] = _.template(t);

            callback(this.ctemplates[name]);
            dfd.resolve();
        }

        return dfd;
    }

};


store = function() {
    return {
        set: function(id, data) {
            localStorage.setItem(id, JSON.stringify(data));
        },
        get: function(id) {
            var data = localStorage.getItem(id);
            if(data === null || data === undefined) {
                return null;
            } else {
                return JSON.parse(data);

            }
        },
        del: function(id) {
            localStorage.removeItem(id);
        },
        delAll: function(ids) {
            for(i=0; i< ids.length; i++) {
                localStorage.removeItem(ids[i]);
            }
        },
        findKey: function(part) {
            var matches = [];
            for (var i = 0, len = localStorage.length; i < len; i++){
                    key = localStorage.key(i) + "";
                    //console.log(typeof key);
                    if (key.indexOf(part) > -1) {
                        matches.push(key);
                    }
               }
            return matches;
        }
    };
}();


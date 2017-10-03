var flarum = require('flarum-gulp');

flarum({
    modules: {
        'pipindex/shaw-flarum-extension': [
            'src/**/*.js'
        ]
    }
});
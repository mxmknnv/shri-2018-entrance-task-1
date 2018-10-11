module.exports = {
    "extends": "airbnb-base",
    "env": {
        "jest": true
    },
    "rules": {
      "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
      "no-use-before-define": ["error", { "functions": false }]
    }
};
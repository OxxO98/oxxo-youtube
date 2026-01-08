module.exports = {
    "extends": [
        'plugin:import/typescript',
        'plugin:import/recommended'
    ],
    "rules": {
        "import/no-restricted-paths": [
            "error",
            {
                "zones": [
                    { "target": "./src/features/*/**", "from": "./src/app" },
                    { "target": "./src/features/*/**", "from": "./src/widgets" },
                    { "target": "./src/entities/*/**", "from": "./src/app" },
                    { "target": "./src/entities/*/**", "from": "./src/widgets" },
                    { "target": "./src/entities/*/**", "from": "./src/features" },
                    { "target": "./src/shared/*/**", "from": "./src/app" },
                    { "target": "./src/shared/*/**", "from": "./src/widgets" },
                    { "target": "./src/shared/*/**", "from": "./src/features" },
                    { "target": "./src/shared/*/**", "from": "./src/entities" },
                    { "target": "./src/pages/*/**", "from": "./src/app" }
                ]
            }
        ],
        "import/no-unresolved": "off",
        "import/named": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
    }
}
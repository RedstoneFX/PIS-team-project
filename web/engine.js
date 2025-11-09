
/// <reference path="converter.js" />

let rawYAMLData = YAML.load(request("cnf/grammar_root.yml"))

console.log(rawYAMLData);
import { createRequire } from "module";
import { readdirSync, readFileSync, lstatSync, existsSync } from "fs";
import { join } from "path";

// Use `createRequire` to load CommonJS modules in an ES module
const require = createRequire(import.meta.url);
const espree = require("espree");

// Parse a JavaScript file and extract function definitions and class methods
const extractFunctionsFromFile = (filePath) => {
  const code = readFileSync(filePath, "utf-8");

  let parsed;
  try {
    // Parse with Espree, supporting modern JavaScript syntax
    parsed = espree.parse(code, {
      ecmaVersion: "latest", // Support the latest ECMAScript version
      sourceType: "module", // Enable parsing for ES modules
      loc: true, // Include location data (line numbers)
    });
  } catch (error) {
    console.error(`Error parsing file "${filePath}": ${error.message}`);
    return [];
  }
  const functions = [];
  const traverse = (node, parent) => {
    if (node.type === "FunctionDeclaration") {
      // Capture standalone functions
      functions.push({
        name: node.id ? node.id.name : "<anonymous>",
        file: filePath,
        line: node.loc.start.line,
        type: "FunctionDeclaration",
      });
    } else if (
      (node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression") &&
      parent.type === "VariableDeclarator"
    ) {
      // Capture functions assigned to variables
      functions.push({
        name: parent.id.name,
        file: filePath,
        line: node.loc.start.line,
        type:
          node.type === "ArrowFunctionExpression"
            ? "ArrowFunction"
            : "FunctionExpression",
      });
    } else if (node.type === "MethodDefinition") {
      // Capture methods in classes
      functions.push({
        name: node.key.name,
        file: filePath,
        line: node.loc.start.line,
        type: `ClassMethod (${node.kind})`, // `kind` can be "constructor", "method", "get", or "set"
      });
    }
    for (const key in node) {
      if (node[key] && typeof node[key] === "object") {
        traverse(node[key], node);
      }
    }
  };

  traverse(parsed, null);
  return functions;
};

// Recursively find all JavaScript and `.mjs` files in a directory, ignoring specified paths and symlinks
const getJavaScriptFiles = (dir, ignoredPaths) => {
  const files = readdirSync(dir);
  let jsFiles = [];

  files.forEach((file) => {
    const fullPath = join(dir, file);

    // Ignore specified paths (e.g., "tests")
    if (ignoredPaths.some((ignored) => fullPath.includes(ignored))) {
      return;
    }

    // Ignore symbolic links
    const stat = lstatSync(fullPath);
    if (stat.isSymbolicLink()) {
      return;
    }

    if (stat.isDirectory()) {
      jsFiles = [...jsFiles, ...getJavaScriptFiles(fullPath, ignoredPaths)];
    } else if (
      file.endsWith(".js") ||
      file.endsWith(".mjs") ||
      file.endsWith(".jsm")
    ) {
      jsFiles.push(fullPath);
    }
  });

  return jsFiles;
};

// Extract function definitions and methods from a Node.js project
const extractFunctionsFromProject = (projectDir, ignoredPaths) => {
  const jsFiles = getJavaScriptFiles(projectDir, ignoredPaths);
  let allFunctions = [];
  jsFiles.forEach((file) => {
    const functions = extractFunctionsFromFile(file);
    allFunctions = [...allFunctions, ...functions];
  });
  return allFunctions;
};

// Main execution
const main = () => {
  const projectDir = process.argv[2]; // Get project directory from CLI argument
  const ignoredPaths = ["node_modules", "tests"]; // Ignore these directories or paths

  if (!projectDir) {
    console.error(
      "Usage: node extractFunctionsWithMethods.mjs <project_directory>",
    );
    process.exit(1);
  }

  if (!existsSync(projectDir)) {
    console.error(`Error: Directory "${projectDir}" does not exist.`);
    process.exit(1);
  }

  const functions = extractFunctionsFromProject(projectDir, ignoredPaths);

  console.log("Function Definitions and Methods:");
  console.table(functions);
};

// Execute main function
main();

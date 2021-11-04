export const docs = [{"href":"contributing#contributing","title":"Contributing","content":"If you are interested in helping out, you can find our GitHub page and the contributing guide should provide some guidance. If you need something more specific, feel free to reach out to @AlecAivazis on the Svelte discord. There's lots to do regardless of how deep you want to dive 🙂"},{"href":"getting-started#installation","title":"Installation","content":"houdini is available on npm.yarn add -D houdini houdini-preprocess\n# or\nnpm install --save-dev houdini houdini-preprocess"},{"href":"getting-started#configuring-your-application","title":"Configuring Your Application","content":"Adding houdini to an existing project can easily be done with the provided command-line tool. If you don't already have an existing app, visit this link for help setting one up. Once you have a project and want to add houdini, execute the following command which will create a few necessary files, as well as pull down a json representation of your API's schema.npx houdini initThis will send a request to your API to download your schema definition. If you need\nheaders to authenticate this request, you can pass them in with the --pull-header\nflag (abbreviated -ph). For example,\nnpx houdini init -ph Authorization=\"Bearer MyToken\".\nYou will also need to provide the same flag to generate when using the\n--pull-schema flag.\nFinally, follow the steps appropriate for your framework."},{"href":"getting-started#sveltekit","title":"SvelteKit","content":"We need to define an alias so that your codebase can import the generated runtime. Add the following values to svelte.config.js:import houdini from 'houdini-preprocess'\n\n{\n    preprocess: [houdini()],\n\n    kit: {\n        vite: {\n            resolve: {\n                alias: {\n                    $houdini: path.resolve('.', '$houdini')\n                }\n            }\n        }\n    }\n}And finally, we need to configure our application to use the generated network layer. To do this, add the following block of code to src/routes/__layout.svelte:<script context=\"module\">\n\timport env from '../environment'; import {setEnvironment} from '$houdini'; setEnvironment(env);\n</script>You might need to generate your runtime in order to fix typescript errors.Note: If you are building your application with\nadapter-static (or any other adapter that turns\nyour application into a static site), you will need to set the static value in your config file to true."},{"href":"getting-started#sapper","title":"Sapper","content":"You'll need to add the preprocessor to both your client and your server configuration:import houdini from 'houdini-preprocess'\n\n// add to both server and client configurations\n{\n\tplugins: [\n\t\tsvelte({\n\t\t\tpreprocess: [houdini()],\n\t\t}),\n\t]\n}With that in place, the only thing left to configure your Sapper application is to connect your client and server to the generate network layer:// in both src/client.js and src/server.js\n\nimport { setEnvironment } from '$houdini'\nimport env from './environment'\n\nsetEnvironment(env)"},{"href":"getting-started#svelte","title":"Svelte","content":"If you are working on an application that isn't using SvelteKit or Sapper, you have to configure the\ncompiler and preprocessor to generate the correct logic by setting the framework field in your\nconfig file to \"svelte\".Please keep in mind that returning the response from a query, you should not rely on this.redirect to handle the\nredirect as it will update your browsers location attribute, causing a hard transition to that url. Instead, you should\nuse this.error to return an error and handle the redirect in a way that's appropriate for your application."},{"href":"getting-started#running-the-compiler","title":"Running the Compiler","content":"The compiler is responsible for a number of things, ranging from generating the actual runtime\nto creating types for your documents. Running the compiler can be done with npx or via a script\nin package.json and needs to be run every time a GraphQL document in your source code changes:npx houdini generateThe generated runtime can be accessed by importing $houdini anywhere in your application.If you have updated your schema on the server, you can pull down the most recent schema before generating your runtime by using --pull-schema or -p:npx houdini generate --pull-schema"},{"href":"getting-started#config-file","title":"📄 Config File","content":"All configuration for your houdini application is defined in a single file that is imported by both the runtime and the\ncommand-line tool. Because of this, you must make sure that any imports and logic are resolvable in both environments.\nThis means that if you rely on process.env or other node-specifics you will have to use a\nplugin to replace the expression with something that can run in the browser."},{"href":"index#houdini","title":"Houdini","content":"The disappearing GraphQL client for Sapper and SvelteKit.Composable and colocated data requirements for your componentsNormalized cache with declarative updatesGenerated typesSubscriptionsSupport for SvelteKit and SapperPagination (cursors and offsets)At its core, houdini seeks to enable a high quality developer experience without compromising bundle size. Like Svelte, houdini shifts what is traditionally handled by a bloated runtime into a compile step that allows for the generation of an incredibly lean GraphQL abstraction for your application."}]
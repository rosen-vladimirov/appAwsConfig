# NativeScript application with custom hook for awsconfiguration.json support

This application shows how to support `awsconfiguration.json` file for NativeScript projects when building for iOS.

## The problem
According to [docs](https://aws-amplify.github.io/docs/ios/api#configuration), `awsconfiguration.json` must be placed at the root of Xcode project. In NativeScript projects there's no easy way to do this, as NativeScript CLI creates and modifies the Xcode project.

## Suggested solution
Place the `awsconfiguration.json` file in your `<path to App_Resources>/iOS` directory. This way, whenever a change in it is applied, CLI will detect a rebuild of the app is required. However, as the file is in `App_Resources`, NativeScript CLI will place it under `Resources` directory in the Xcode project.
Introduce a new `after-prepare` [hook in the project](./hooks/after-prepare/awsconfiguration-hook.js), which will move the file from the `Resources` dir to the root of the project. After that, by using `xcode` package, the hook will include the `awsconfiguration.json` file in the Xcode project, so it will be used during build of the application.

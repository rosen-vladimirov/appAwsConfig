const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

module.exports = function ($platformsData, hookArgs) {
	return new Promise((resolve, reject) => {
		if (hookArgs.platform.toLowerCase() !== "ios") {
			return resolve();
		}

		const awsConfig = "awsconfiguration.json";
		const platformData = $platformsData.getPlatformData(hookArgs.platform, hookArgs.projectData);
		const appResourcesDestination = platformData.platformProjectService.getAppResourcesDestinationDirectoryPath(hookArgs.projectData);
		const pathToAppResourcesAwsConfig = path.join(appResourcesDestination, awsConfig);
		if (!fs.existsSync(pathToAppResourcesAwsConfig)) {
			// CLI have NOT prepared App_Resources again (or for the first time), so we have already moved the awsconfiguration.json previous time.
			return resolve();
		}

		const projectRoot = platformData.projectRoot;
		const awsConfigCorrectLocation = path.join(projectRoot, awsConfig);
		fs.copyFileSync(pathToAppResourcesAwsConfig, awsConfigCorrectLocation);
		fs.unlinkSync(pathToAppResourcesAwsConfig);

		// File is in correct place, now we have to include it in the pbxproject
		const pbxProjectPath = path.join(projectRoot, `${hookArgs.projectData.projectName}.xcodeproj`, "project.pbxproj");
		if (fs.existsSync(pbxProjectPath)) {
			const pbxProjObject = xcode.project(pbxProjectPath);
			pbxProjObject.parse((err) => {
				if (err) {
					reject(err);
				}

				pbxProjObject.removeResourceFile(awsConfigCorrectLocation);
				pbxProjObject.addResourceFile(awsConfigCorrectLocation);

				fs.writeFileSync(pbxProjectPath, pbxProjObject.writeSync());

				resolve();
			});
		} else {
			reject(new Error(`Unable to find ${pbxProjectPath}. Probably project name is not sanitized.`));
		}
	});
}

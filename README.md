# Hardware app Hycon
Ledger Hardware Wallet Node JS API for Hycon.

## Examples

```js
import Transport from "@ledgerhq/hw-transport-node-hid";
// import Transport from "@ledgerhq/hw-transport-u2f"; // for browser
import Hycon from "@glosfer/hw-app-hycon";
const getHyconAddress = async () => {
  const transport = await Transport.create();
  const hycon = new Hycon(transport);
  const result = await hycon.getAddress("44'/1397'/0'/0");
  return result.stringAddress;
};
getHyconAddress().then(a => console.log(a));
```

### Install dependencies

```bash
yarn
```

### Build

```bash
yarn build
```

### Deploy

Checklist before deploying a new release:

* you have the right in the glosfer org on NPM
* you have run `npm login` once (check `npm whoami`)
* Go to **master** branch
  * your master point on glosfer repository (check with `git config remote.$(git config branch.master.remote).url` and fix it with `git branch --set-upstream master origin/master`)
  * you are in sync (`git pull`) and there is no changes in `git status`
* Run `yarn` once, there is still no changes in `git status`

**deploy a new release**

```
 yarn clean
 yarn
 yarn build
 yarn run publish
```

then, go to [/releases](https://github.com/Team-Hycon/hw-app-hycon/releases) and create a release with change logs.

## Issues & Pull Requests

If you have an issue, feel free to add it to the [Issues](https://github.com/Team-Hycon/hw-app-hycon/issues) tab.
If you'd like to help us out, the [Pull Request](https://github.com/Team-Hycon/hw-app-hycon/pulls) tab is a great place to start.

**If you have found a security bug, please contact us at [security@glosfer.com](security@glosfer.com).**

## Authors

* **Dulguun Batmunkh** - *Initial work* <dulguun@glosfer.com>

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

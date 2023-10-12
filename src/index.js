const { LemmyHttp } = require("lemmy-js-client");

const localUrl = process.env.LOCAL_URL;
const localUsername = process.env.LOCAL_USERNAME;
const localPassword = process.env.LOCAL_PASSWORD;
const remoteInstances = JSON.parse(process.env.REMOTE_INSTANCES)
const minutesBetweenRuns = parseInt(process.env.MINUTES_BETWEEN_RUNS);

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

const setEquals = (xs, ys) =>
  xs.size === ys.size &&
  [...xs].every((x) => ys.has(x));

async function setDiff(setA, setB) {
  let add = new Set();
  let del = new Set();
  // Check for instances to add
  for await (const b of setB) {
    let found = false;
    for await (const a of setA) {
      if (a == b) {
        found = true;
        break;
      }
    }
    if (!found) {
      add.add(b)
    }
  }
  // Check for instances to remove
  for await (const a of setA) {
    let found = false;
    for await (const b of setB) {
      if (a == b) {
        found = true;
        break;
      }
    }
    if (!found) {
      del.add(a)
    }
  }
  return {
    add: add,
    del: del,
  }
}

async function main() {
  while (true) {
    try {
      console.log(`Getting ${localUrl} defederation list`);
      let localClient = new LemmyHttp(localUrl);
      let loginForm = {
        username_or_email: localUsername,
        password: localPassword,
      };
      let user = await localClient.login(loginForm);
      localClient.setHeaders({Authorization: "Bearer " + user.jwt});
      let localInstances = await localClient.getFederatedInstances({});
      let localBlocked = new Set();
      for await (const localInstance of localInstances.federated_instances.blocked) {
        localBlocked.add(localInstance.domain);
      }
      let remoteBlocked = new Set();
      for await (const remoteInstance of remoteInstances) {
        console.log(`Getting https://${remoteInstance} defederation list`);
        let remoteClient = new LemmyHttp(`https://${remoteInstance}`);
        let remoteInstances = await remoteClient.getFederatedInstances({});
        for await (const blocked of remoteInstances.federated_instances.blocked) {
          remoteBlocked.add(blocked.domain);
        }
      }
      if (setEquals(remoteBlocked, localBlocked)) {
        console.log(`Defederation list matches.`);
      } else {
        console.log(`Defederation list does not match.`);
        const diff = await setDiff(localBlocked, remoteBlocked);
        if (diff.add.size > 0) {
          console.log(`Adding ${JSON.stringify(Array.from(diff.add))}`);
        }
        if (diff.del.size > 0) {
          console.log(`Removing ${JSON.stringify(Array.from(diff.del))}`);
        }
        await localClient.editSite({
          auth: user.jwt,
          blocked_instances: Array.from(remoteBlocked),
        });
        console.log(`Defederation list updated.`);
      }
    } catch (e) {
      console.log(e);
    }
    console.log(`Sleeping ${minutesBetweenRuns} minutes`);
    await sleep(minutesBetweenRuns * 60);
  }

}

main();

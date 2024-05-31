import { toNano } from '@ton/core';
import { ThrowErrors } from '../wrappers/ThrowErrors';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const throwErrors = provider.open(await ThrowErrors.fromInit());

    await throwErrors.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(throwErrors.address);

    // run methods on `throwErrors`
}

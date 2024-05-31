import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ThrowErrors } from '../wrappers/ThrowErrors';
import '@ton/test-utils';

describe('ThrowErrors', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let throwErrors: SandboxContract<ThrowErrors>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        throwErrors = blockchain.openContract(await ThrowErrors.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await throwErrors.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: throwErrors.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and throwErrors are ready to use
    });

    it('should increment until it throws an error', async() => {
        for(let i = 0; i < 4; i++) {
            const incrementResult = await throwErrors.send(
                deployer.getSender(),
                {
                    value: toNano('0.05')
                },
                'increment'
            );

            expect(incrementResult.transactions).toHaveTransaction({
                from: deployer.address,
                to: throwErrors.address,
                success: true
            });
        }

        const incrementResult = await throwErrors.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'increment'
        );

        const contractValue = await throwErrors.getValue();
        console.log(`the final contract value: ${contractValue}`);

        expect(incrementResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: throwErrors.address,
            success: false
        });
    });

    it('should throw an error on division by zero', async() => {
        const divideResult = await throwErrors.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            {
                $$type: 'Divide',
                by: 0n
            }
        );

        expect(divideResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: throwErrors.address,
            success: false
        });
    });

    it('should throw a specific error code for no access', async() => {
        const noAccessResult = await throwErrors.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'no access'
        );

        expect(noAccessResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: throwErrors.address,
            success: false,
            exitCode: 132
        });
    });

});

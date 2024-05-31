import "@stdlib/deploy";

message Divide {
    by: Int as uint32;
}

contract ThrowErrors with Deployable {

    val: Int as int64;

    init() {
        self.val = 0;
    }

    // Increment and error if val >= 5
    receive("increment") {
        self.val = self.val + 1;
        require(self.val < 5, "Counter is too high");
    }

    // Handle division, revert on exception
    receive(msg: Divide) {
        self.val = self.val / msg.by;
    }

    // Throw specific exit code 132
    // https://docs.ton.org/learn/tvm-instructions/tvm-exit-codes
    receive("no access") {
        throw(132);
    }

    get fun value(): Int {
        return self.val;
    }

}

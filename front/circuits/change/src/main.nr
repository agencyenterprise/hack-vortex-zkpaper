use dep::std::hash::poseidon;
use dep::std::hash::poseidon2;

fn main(x: [Field; 2], y: Field) -> pub Field {
    let hash = poseidon::bn254::hash_2(x);
    assert(hash == y);
    hash
}

#[test]
fn test_main() {
    let hash = main(
        [1, 2],
        7853200120776062878684798364095072458815029376092732009249414926327459813530
    );
    assert(hash == 7853200120776062878684798364095072458815029376092732009249414926327459813530);
}

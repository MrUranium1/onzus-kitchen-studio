# Security Specification - Onzus Kitchen

## Data Invariants
1. A product must have a valid ID, name, and positive price.
2. Only verified admins can create, update, or delete products.
3. Users can only read their own profile data (if any).
4. Products are publicly readable.

## The Dirty Dozen Payloads

1. **Identity Spoofing (Products)**: Trying to create a product as a non-admin.
2. **Identity Spoofing (Users)**: Trying to read another user's profile.
3. **Identity Spoofing (Admins)**: Trying to add oneself to the `admins` collection.
4. **Resource Poisoning (Products)**: Creating a product with a 1MB string in the name.
5. **State Shortcut (Products)**: Updating a product to have a negative price.
6. **Shadow Update (Products)**: Adding a `ghostField: true` to a product document.
7. **Orphaned Writes (Products)**: Creating a product without required fields.
8. **Bypassing Verification**: Admin actions with an unverified email (if email verification is forced).
9. **Denial of Wallet**: Massive query on products without limits (managed by Firebase limits, but rules can help).
10. **Type Mismatch**: Sending a string for the price field.
11. **Malicious ID**: Creating a product with a path variable like `../illegal`.
12. **PII Leak**: Requesting the entire `users` collection as a standard user.

## Test Runner (Conceptual)
// A conceptual test runner to verify these rules (would be firestore.rules.test.ts in a real setup)
// ...

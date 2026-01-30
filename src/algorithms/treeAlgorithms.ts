export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number; // For visualization positioning
  y: number;
}

/**
 * In-Order Traversal (Left, Root, Right)
 * Yields nodes in ascending order.
 */
export async function* inOrder(node: TreeNode | null): AsyncGenerator<any> {
  if (!node) return;

  yield* inOrder(node.left);

  // Visit Logic
  yield { activeNode: node, type: 'VISIT', line: 5 };

  yield* inOrder(node.right);
}

/**
 * Pre-Order Traversal (Root, Left, Right)
 * Great for cloning trees.
 */
export async function* preOrder(node: TreeNode | null): AsyncGenerator<any> {
  if (!node) return;

  yield { activeNode: node, type: 'VISIT', line: 2 };
  yield* preOrder(node.left);
  yield* preOrder(node.right);
}

/**
 * Post-Order Traversal (Left, Right, Root)
 * Used for deleting trees or calculating folder sizes.
 */
export async function* postOrder(node: TreeNode | null): AsyncGenerator<any> {
  if (!node) return;

  yield* postOrder(node.left);
  yield* postOrder(node.right);
  yield { activeNode: node, type: 'VISIT', line: 8 };
}

export const treeCode = {
  inOrder: `function inOrder(node) {
  if (!node) return;
  inOrder(node.left);
  visit(node);
  inOrder(node.right);
}`,
  preOrder: `function preOrder(node) {
  visit(node);
  preOrder(node.left);
  preOrder(node.right);
}`,
  postOrder: `function postOrder(node) {
  postOrder(node.left);
  postOrder(node.right);
  visit(node);
}`,
};

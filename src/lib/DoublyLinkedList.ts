export interface DLLNode<T> {
  value: T;
  prev: DLLNode<T> | null;
  next: DLLNode<T> | null;
}

export class DoublyLinkedList<T> {
  private head: DLLNode<T> | null = null;
  private tail: DLLNode<T> | null = null;
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  getHead(): DLLNode<T> | null {
    return this.head;
  }

  getTail(): DLLNode<T> | null {
    return this.tail;
  }

  append(value: T): DLLNode<T> {
    const node: DLLNode<T> = { value, prev: null, next: null };
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
    return node;
  }

  prepend(value: T): DLLNode<T> {
    const node: DLLNode<T> = { value, prev: null, next: null };
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
    return node;
  }

  insertAfter(refNode: DLLNode<T>, value: T): DLLNode<T> {
    if (refNode === this.tail) {
      return this.append(value);
    }
    const node: DLLNode<T> = { value, prev: refNode, next: refNode.next };
    if (refNode.next !== null) {
      refNode.next.prev = node;
    }
    refNode.next = node;
    this._size++;
    return node;
  }

  remove(node: DLLNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
    this._size--;
  }

  findNode(predicate: (v: T) => boolean): DLLNode<T> | null {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.value)) return current;
      current = current.next;
    }
    return null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  shuffle(): void {
    const arr = this.toArray();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this.head = null;
    this.tail = null;
    this._size = 0;
    for (const item of arr) {
      this.append(item);
    }
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}

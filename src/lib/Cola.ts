export interface NodoCancion<T> {
  value: T;
  prev: NodoCancion<T> | null;
  next: NodoCancion<T> | null;
}

export class Cola<T> {
  private head: NodoCancion<T> | null = null;
  private tail: NodoCancion<T> | null = null;
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  getHead(): NodoCancion<T> | null {
    return this.head;
  }

  getTail(): NodoCancion<T> | null {
    return this.tail;
  }

  append(value: T): NodoCancion<T> {
    const node: NodoCancion<T> = { value, prev: null, next: null };
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

  prepend(value: T): NodoCancion<T> {
    const node: NodoCancion<T> = { value, prev: null, next: null };
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

  insertAfter(refNode: NodoCancion<T>, value: T): NodoCancion<T> {
    if (refNode === this.tail) {
      return this.append(value);
    }
    const node: NodoCancion<T> = { value, prev: refNode, next: refNode.next };
    if (refNode.next !== null) {
      refNode.next.prev = node;
    }
    refNode.next = node;
    this._size++;
    return node;
  }

  // Mueve un nodo existente a otra posición — O(1), no crea nodos nuevos
  moveAfter(nodeToMove: NodoCancion<T>, afterNode: NodoCancion<T> | null): void {
    if (nodeToMove === afterNode) return;

    // 1. Desenlazar nodeToMove de su posición actual
    if (nodeToMove.prev !== null) {
      nodeToMove.prev.next = nodeToMove.next;
    } else {
      this.head = nodeToMove.next;
    }
    if (nodeToMove.next !== null) {
      nodeToMove.next.prev = nodeToMove.prev;
    } else {
      this.tail = nodeToMove.prev;
    }

    // 2. Re-enlazar después de afterNode (null = mover al principio)
    if (afterNode === null) {
      nodeToMove.prev = null;
      nodeToMove.next = this.head;
      if (this.head !== null) this.head.prev = nodeToMove;
      this.head = nodeToMove;
      if (this.tail === null) this.tail = nodeToMove;
    } else {
      nodeToMove.prev = afterNode;
      nodeToMove.next = afterNode.next;
      if (afterNode.next !== null) afterNode.next.prev = nodeToMove;
      afterNode.next = nodeToMove;
      if (nodeToMove.next === null) this.tail = nodeToMove;
    }
    // _size no cambia: el nodo se movió, no se agregó ni eliminó
  }

  remove(node: NodoCancion<T>): void {
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

  findNode(predicate: (v: T) => boolean): NodoCancion<T> | null {
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

  // Devuelve todos los nodos en orden actual
  getNodes(): NodoCancion<T>[] {
    const nodes: NodoCancion<T>[] = [];
    let cur = this.head;
    while (cur !== null) { nodes.push(cur); cur = cur.next; }
    return nodes;
  }

  // Re-enlaza los nodos en el orden dado — preserva referencias, sin crear nodos nuevos
  reorderNodes(nodes: NodoCancion<T>[]): void {
    if (nodes.length === 0) { this.head = null; this.tail = null; return; }
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].prev = nodes[i - 1] ?? null;
      nodes[i].next = nodes[i + 1] ?? null;
    }
    this.head = nodes[0];
    this.tail = nodes[nodes.length - 1];
  }

  // Aleatoriza re-enlazando punteros — los nodos existentes conservan sus referencias.
  // Si se pasa anchorNode, ese nodo queda al principio (canción actual).
  shuffleNodes(anchorNode?: NodoCancion<T> | null): void {
    const nodes = this.getNodes();
    if (nodes.length <= 1) return;

    // Separar el ancla del resto
    let anchor: NodoCancion<T> | null = null;
    let rest = nodes;
    if (anchorNode) {
      const idx = nodes.indexOf(anchorNode);
      if (idx > -1) {
        anchor = nodes[idx];
        rest = [...nodes.slice(0, idx), ...nodes.slice(idx + 1)];
      }
    }

    // Fisher-Yates sobre el resto
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }

    this.reorderNodes(anchor ? [anchor, ...rest] : rest);
  }

  reverse(): void {
    const nodes = this.getNodes();
    nodes.reverse();
    this.reorderNodes(nodes);
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}

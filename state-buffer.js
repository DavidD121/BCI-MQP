class Buffer {
  constructor(size) {
    this.size = size;
    this.buffer = [];
  }

  add(element) {
    this.buffer.push(element);
    if (this.buffer.length > this.size) {
      this.buffer.shift();
    }
  }

  average() {
    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i];
    }
    return sum / this.buffer.length;
  }

  isFull() {
    return self.buffer.length == this.size;
  }

  empty() {
    this.buffer ==[]
  }
}
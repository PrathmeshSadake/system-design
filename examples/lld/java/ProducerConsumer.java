public class ProducerConsumer {
  static class Buffer {
    final int[] data;
    int size;
    int head;
    int tail;
    Buffer(int capacity) { data = new int[capacity]; }

    synchronized void put(int value) throws InterruptedException {
      while (size == data.length) wait();
      data[tail] = value;
      tail = (tail + 1) % data.length;
      size += 1;
      notifyAll();
    }

    synchronized int take() throws InterruptedException {
      while (size == 0) wait();
      int value = data[head];
      head = (head + 1) % data.length;
      size -= 1;
      notifyAll();
      return value;
    }
  }

  public static void main(String[] args) throws Exception {
    Buffer buffer = new Buffer(2);
    Thread producer = new Thread(() -> {
      try {
        buffer.put(1);
        buffer.put(2);
        buffer.put(3);
      } catch (InterruptedException ex) {
        throw new RuntimeException(ex);
      }
    });
    producer.start();
    Thread.sleep(30);
    if (buffer.take() != 1 || buffer.take() != 2 || buffer.take() != 3) throw new RuntimeException("order");
    producer.join();
    System.out.println("ok");
  }
}

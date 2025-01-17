import {read, open, stat, BigIntStats} from 'fs';

/** file reading result */
export type FileReadResult = {
  /** amount of the bytes read */
  bytesRead: number;
  /** the buffer filled with data from file*/
  buffer: Buffer;
};

/** Object handling file info */
export class FileHandle {
  private fileDescriptor: number;
  private stats: BigIntStats;
  private constructor(fileDescriptor: number, stats: BigIntStats) {
    this.fileDescriptor = fileDescriptor;
    this.stats = stats;
  }
  /**
   * Opens a `FileHandle`.
   *
   * @param path path to the file
   * @return Fulfills with a {FileHandle} object.
   */

  static open = async (path: string): Promise<FileHandle> => {
    const [fd, stats] = await Promise.all([
      new Promise<number>((s) => {
        open(path, undefined, undefined, (_err, fd) => s(fd));
      }),
      new Promise<BigIntStats>((s) => {
        stat(path, {bigint: true}, (_err, stats) => s(stats));
      })
    ]);
    return new FileHandle(fd, stats);
  };

  /**
   * Reads data from the file and stores that in the given buffer.
   *
   * If the file is not modified concurrently, the end-of-file is reached when the
   * number of bytes read is zero.
   * @param buffer A buffer that will be filled with the file data read.
   * @param offset The location in the buffer at which to start filling.
   * @param length The number of bytes to read.
   * @param position The location where to begin reading data from the file. If `null`, data will be read from the current file position, and the position will be updated. If `position` is an
   * integer, the current file position will remain unchanged.
   * @return Fulfills upon success with a FileReadResult object
   */
  read = (
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | bigint
  ): Promise<FileReadResult> => {
    return new Promise((s) => {
      read(this.fileDescriptor, buffer, offset, length, position, (_err, bytesRead, buffer) =>
        s({bytesRead, buffer})
      );
    });
  };

  get stat(): BigIntStats {
    return this.stats;
  }
}

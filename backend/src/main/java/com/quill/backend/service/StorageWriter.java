package com.quill.backend.service;

import com.quill.backend.model.DataRecord;
import com.quill.backend.model.Storage;

@FunctionalInterface
public interface StorageWriter {
    /**
     * Write data to a storage destination
     * @param record The data record to write
     * @param storage The storage configuration
     * @throws Exception if the write operation fails
     */
    void write(DataRecord record, Storage storage) throws Exception;
}
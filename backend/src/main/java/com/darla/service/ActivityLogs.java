package com.darla.service;

import java.time.LocalDateTime;
import java.util.Deque;
import java.util.LinkedList;

public class ActivityLogs {
	
	static final int MAX_SIZE = 5;
	static Deque<Entry> deque = new LinkedList<>();
	
	public static class Entry{
		String message;
		LocalDateTime timestamp;

		Entry(String message, LocalDateTime timestamp) {
			this.message = message;
			this.timestamp = LocalDateTime.now();
		}

		public void setMessage(String message) {
			this.message = message;
		}

		public void setTimestamp(LocalDateTime timestamp) {
			this.timestamp = timestamp;
		}

		public String getMessage() {
			return message;
		}

		public LocalDateTime getTimestamp() {
			return timestamp;
		}
		@Override
		public String toString() {
			return "Entry [message=" + message + ", timestamp=" + timestamp + "]";
		}
		
	}
	
	public static void addEntry(String message) {
		Entry entry = new Entry(message, LocalDateTime.now());
		deque.addFirst(entry);
		// Remove the oldest entry if the deque exceeds the maximum size
		if (deque.size() >= MAX_SIZE) {
			deque.removeLast();
		}
	}
	

}

CC = gcc
CXX = g++
DEBUG_FLAGS = -O2 -g
IFLAGS = -I/usr/local/include
CFlAGS = -Wall $(DEBUG_FLAGS)
CXXFLAGS = -Wall $(DEBUG_FLAGS)
BIN_DIR = .
TARGET = ./best_image_demo
LFLAGS = -lpthread -lz -ldl -lrt
OBJS = best_image_demo.o

all: $(TARGET)
clean:
	rm -f $(TARGET)
	rm -f $(OBJS)

$(TARGET): $(OBJS)
	$(CXX) $(OBJS) $(LFLAGS) -o $(TARGET) -llocal_image_compressor

best_image_demo.o: best_image_demo.cc
	$(CXX) $(IFLAGS) $(CXXFLAGS) best_image_demo.cc -c

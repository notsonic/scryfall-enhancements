release:
	mkdir release
	cd src && zip -r ../release/release.zip ./*



.PHONY: clean
clean:
	rm -rf release
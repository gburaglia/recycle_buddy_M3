// Class to define each hand
class Hand {
  constructor(keypoints) {
    this.keypoints = keypoints;
    this.extremeLeft = this.keypoints[0];
    this.extremeRight = this.keypoints[0];
    this.extremeTop = this.keypoints[0];
    this.extremeBottom = this.keypoints[0];
    this.maxDistance = 0;
    this.diameter = 0.85 * this.maxDistance;
    this.centerX = 0;
    this.centerY = 0;
    this.fingercounter = 0;
  }

  searchExtremePoints() {
    // Iterate through the keypoints to find the extreme points
    for (let i = 1; i < this.keypoints.length; i++) {
      let point = this.keypoints[i];

      // Update extreme left, right, top, bottom points
      if (point.x < this.extremeLeft.x) {
        this.extremeLeft = point;
      }
      if (point.x > this.extremeRight.x) {
        this.extremeRight = point;
      }
      if (point.y < this.extremeTop.y) {
        this.extremeTop = point;
      }
      if (point.y > this.extremeBottom.y) {
        this.extremeBottom = point;
      }
    }
  }

  makeBoundary() {
    // Find the center by averaging the X and Y coordinates
    this.centerX = (this.extremeLeft.x + this.extremeRight.x) / 2;
    this.centerY = (this.extremeTop.y + this.extremeBottom.y) / 2;

    // Try out 4 combinations to find maxDistanace
    // Update the diameter and maxDistance in calcDistance
    this.calcDistance(
      this.extremeLeft.x,
      this.extremeLeft.y,
      this.extremeRight.x,
      this.extremeRight.y
    );
    this.calcDistance(
      this.extremeLeft.x,
      this.extremeLeft.y,
      this.extremeTop.x,
      this.extremeTop.y
    );
    this.calcDistance(
      this.extremeLeft.x,
      this.extremeLeft.y,
      this.extremeBottom.x,
      this.extremeBottom.y
    );
    this.calcDistance(
      this.extremeTop.x,
      this.extremeTop.y,
      this.extremeBottom.x,
      this.extremeBottom.y
    );
  }

  countFingers() {
    for (let i = 0; i < this.keypoints.length; i++) {
      let fingerTip = this.keypoints[i];
      // Only if point is on a finger tip
      if (this.keypoints[i].name.includes("tip")) {
        let d = this.calcDistance(
          fingerTip.x,
          fingerTip.y,
          this.centerX,
          this.centerY
        );

        // Only if finger tip is outside boundary circle
        if (d > this.diameter / 2) {
          // Increase finger counter
          this.fingercounter += 1;
          // Draw finger tip circle
          circle(fingerTip.x, fingerTip.y, 15);
        }
      }
    }
    return this.fingercounter;
  }

  calcDistance(x1, y1, x2, y2) {
    let distance = dist(x1, y1, x2, y2);

    // Update maxDistance and diameter
    if (distance > this.maxDistance) {
      this.maxDistance = distance;
      this.diameter = 0.85 * this.maxDistance;
    }
    return distance;
  }
}

/*global define*/
define([
        '../Core/destroyObject',
        '../Core/Ellipsoid',
        '../Core/Cartesian3',
        '../Core/Cartesian4',
        '../Core/Matrix4',
        '../Core/Transforms',
        './CameraEventHandler',
        './CameraEventType',
        './CameraSpindleController',
        './CameraFreeLookController'
    ], function(
        destroyObject,
        Ellipsoid,
        Cartesian3,
        Cartesian4,
        Matrix4,
        Transforms,
        CameraEventHandler,
        CameraEventType,
        CameraSpindleController,
        CameraFreeLookController) {
    "use strict";

    /**
     * DOC_TBD
     * @name CameraCentralBodyController
     * @constructor
     */
    function CameraCentralBodyController(canvas, camera, ellipsoid) {
        this._canvas = canvas;
        this._camera = camera;

        this._spindleController = new CameraSpindleController(canvas, camera, ellipsoid);
        this._freeLookController = new CameraFreeLookController(canvas, camera);
        this._freeLookController.horizontalRotationAxis = Cartesian3.UNIT_Z;

        this._rotateHandler = new CameraEventHandler(canvas, CameraEventType.MIDDLE_DRAG);

        this._transform = Matrix4.IDENTITY;
    }

    /**
     * @private
     */
    CameraCentralBodyController.prototype.update = function() {
        var rotate = this._rotateHandler;
        var rotating = rotate.isMoving() && rotate.getMovement();

        if (rotating) {
            var movement = rotate.getMovement();
            var press = rotate.getButtonPressTime();
            var release = rotate.getButtonReleaseTime();

            if (typeof press !== 'undefined' && (typeof release === 'undefined' || press.greaterThan(release))) {
                var center = this._camera.pickEllipsoid(this._spindleController.getEllipsoid(), movement.startPosition);
                if (typeof center === 'undefined') {
                    this._transform = Matrix4.IDENTITY;
                } else {
                    this._transform = Transforms.eastNorthUpToFixedFrame(center);
                }
            }

            this._rotate(movement);
        }

        this._spindleController.update();
        this._freeLookController.update();

        return true;
    };

    CameraCentralBodyController.prototype._rotate = function(movement) {
        var transform = this._transform;
        var camera = this._camera;
        var position = camera.position;
        var up = camera.up;
        var right = camera.right;
        var direction = camera.direction;

        var oldTransform = camera.transform;
        var oldEllipsoid = this._spindleController.getEllipsoid();
        var oldConstrainedZ = this._spindleController.constrainedAxis;

        this._spindleController.setReferenceFrame(transform, Ellipsoid.UNIT_SPHERE);
        this._spindleController.constrainedAxis = Cartesian3.UNIT_Z;

        var invTransform = camera.getInverseTransform();
        camera.position = invTransform.multiplyWithVector(new Cartesian4(position.x, position.y, position.z, 1.0)).getXYZ();
        camera.up = invTransform.multiplyWithVector(new Cartesian4(up.x, up.y, up.z, 0.0)).getXYZ();
        camera.right = invTransform.multiplyWithVector(new Cartesian4(right.x, right.y, right.z, 0.0)).getXYZ();
        camera.direction = invTransform.multiplyWithVector(new Cartesian4(direction.x, direction.y, direction.z, 0.0)).getXYZ();

        this._spindleController._rotate(movement);

        position = camera.position;
        up = camera.up;
        right = camera.right;
        direction = camera.direction;

        this._spindleController.setReferenceFrame(oldTransform, oldEllipsoid);
        this._spindleController.constrainedAxis = oldConstrainedZ;

        camera.position = transform.multiplyWithVector(new Cartesian4(position.x, position.y, position.z, 1.0)).getXYZ();
        camera.up = transform.multiplyWithVector(new Cartesian4(up.x, up.y, up.z, 0.0)).getXYZ();
        camera.right = transform.multiplyWithVector(new Cartesian4(right.x, right.y, right.z, 0.0)).getXYZ();
        camera.direction = transform.multiplyWithVector(new Cartesian4(direction.x, direction.y, direction.z, 0.0)).getXYZ();
    };

    /**
      * Returns true if this object was destroyed; otherwise, false.
      * <br /><br />
      * If this object was destroyed, it should not be used; calling any function other than
      * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
      *
      * @memberof CameraCentralBodyController
      *
      * @return {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
      *
      * @see CameraCentralBodyController#destroy
      */
    CameraCentralBodyController.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Removes mouse and keyboard listeners held by this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @memberof CameraCentralBodyController
     *
     * @return {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see CameraCentralBodyController#isDestroyed
     *
     * @example
     * controller = controller && controller.destroy();
     */
    CameraCentralBodyController.prototype.destroy = function() {
        this._rotateHandler = this._rotateHandler && this._rotateHandler.destroy();
        this._spindleController = this._spindleController && this._spindleController.destroy();
        this._freeLookController = this._freeLookController && this._freeLookController.destroy();
        return destroyObject(this);
    };

    return CameraCentralBodyController;
});
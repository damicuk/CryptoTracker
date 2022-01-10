/**
 * Represents an asset.
 */
var Asset = class Asset {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {string} ticker - The ticker of the asset.
   * @param {string} assetType - The asset type of the asset.
   * @param {boolean} isFiatBase - Whether the asset is fiat base.
   * @param {number} decimalPlaces - The number of decimal places of the asset.
   */
  constructor(ticker, assetType, isFiatBase, decimalPlaces) {

    /**
     * The ticker of the asset.
     * @type {string}
     */
    this.ticker = ticker;

    /**
     * The asset type of the asset.
     * @type {string}
     */
    this.assetType = assetType;

    /**
     * Whether the asset is fiat base.
     * @type {boolean}
     */
    this.isFiatBase = isFiatBase;

    /**
     * The number of decimal places of the asset.
     * @type {number}
     */
    this.decimalPlaces = decimalPlaces;

  }

  /**
   * Regular expression to loosly validate asset ticker format.
   * @type {RegExp}
   * @static
   */
  static get tickerRegExp() {

    return /^(\w{1,15}:)?[\w$@]{1,10}$/;
  }

  /**
  * Regular expression to validate asset types.
  * @type {RegExp}
  * @static
  */
  static get assetTypeRegExp() {

    return /^[\w\-][\w\-\s]{0,18}[\w\-]$|^[\w\-]$/;
  }

  /**
  * Regular expression to validate decimal places.
  * @type {RegExp}
  * @static
  */
  static get decimalPlacesRegExp() {

    return /^[0-8]$/;
  }

  /**
   * Array of default asset types.
   * @type {Array<string>}
   * @static
   */
  static get defaultAssetTypes() {

    return ['Crypto', 'Fiat', 'Fiat Base', 'Forex', 'Stablecoin', 'Stock'];
  }

  /**
   * Whether the asset is fiat.
   * @type {boolean}
   */
  get isFiat() {

    return this.assetType === 'Fiat';

  }

  /**
   * The number of subunits in a unit of the asset.
   * @type {number}
   */
  get subunits() {

    return 10 ** this.decimalPlaces;

  }

  /**
   * Override toString() to return the asset ticker.
   * @return {string} The asset ticker.
   */
  toString() {

    return this.ticker;

  }
};
